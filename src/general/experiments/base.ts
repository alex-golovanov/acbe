/* global DynamicConfig */
import log from 'log';
import storage from 'storage';
import { ExperimentConfig, ExperimentEngagementData } from './type';
import jitsu from 'jitsu';

export abstract class Experiment {
  public readonly expNumber: number;
  protected readonly storageKey: string;

  constructor(expNumber: number) {
    this.expNumber = expNumber;
    this.storageKey = `exp${expNumber}`;
  }

  protected abstract getDefaultConfig(): ExperimentConfig;

  public async isEnabled(): Promise<boolean> {
    const mergedConfig = await this.getMergedConfig();
    return mergedConfig.enabled;
  }

  public async isEngaged(): Promise<boolean> {
    const data: ExperimentEngagementData | undefined = await storage.get(this.storageKey);
    const isEngaged = data !== undefined && data !== null;
    return isEngaged;
  }

  public async getVariant(): Promise<number | null> {
    if (!(await this.isEnabled())) {
      return null;
    }

    const data = await storage.get(this.storageKey) as ExperimentEngagementData | undefined;

    if (data === undefined || data === null) {
      return null;
    }

    return data.variant;
  }

  public async getVariantOrEngage(): Promise<number> {
    const engagedVariant = await this.getVariant();

    if (engagedVariant !== null && engagedVariant !== undefined) {
      return engagedVariant;
    }

    return this.engage();
  }

  public async engage(forceVariant: number | undefined = undefined): Promise<number> {
    const mergedConfig = await this.getMergedConfig();

    if (!mergedConfig.enabled) {
      throw new Error(`Experiment ${this.expNumber} is disabled`);
    }

    if (forceVariant && forceVariant > mergedConfig.distribution.length) {
      throw new Error(`Invalid variant: ${forceVariant}, distribution length: ${mergedConfig.distribution.length}`);
    }

    const variant = forceVariant || this.selectVariant(mergedConfig.distribution);

    const engagementData: ExperimentEngagementData = {
      engagedAt: new Date(),
      variant,
      configWhenEngaged: mergedConfig
    };

    await storage.set(this.storageKey, engagementData);

    log(`[${this.storageKey}#engage]`, engagementData);

    jitsu.track('experiment_tag', {
      expvarid: `exp_${this.expNumber}_${engagementData.variant}`,
    });

    return variant;
  }

  public async disengage(): Promise<void> {
    await storage.remove(this.storageKey);
  }

  protected selectVariant(distribution: number[]): number {
    const random = Math.random() * 100;
    let cumulativePercentage = 0;

    for (let i = 0; i < distribution.length; i++) {
      cumulativePercentage += distribution[i];
      if (random <= cumulativePercentage) {
        return i;
      }
    }

    // Default to the first variant if something goes wrong
    return 0;
  }

  protected async getDynamicConfig(): Promise<Partial<ExperimentConfig>> {
    const dynamicConfig = await storage.get('dynamicConfig') as DynamicConfig;
    const expConfig = dynamicConfig?.experiments?.[this.storageKey] || {};
    return expConfig;
  }

  protected async getMergedConfig(): Promise<ExperimentConfig> {
    const dynamicConfig = await this.getDynamicConfig();
    const defaultConfig = this.getDefaultConfig();
    return {
      ...defaultConfig,
      ...dynamicConfig,
    };
  }
}
