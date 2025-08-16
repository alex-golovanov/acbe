import { Experiment } from './base';
import { Experiment408 } from './instances';
import log from 'log';

interface ExperimentWithVariant {
  experiment: Experiment;
  variant: number | null;
}

class ExperimentsHelper {
  public static readonly supportedExperiments = [
    Experiment408
  ];

  public experimentInstances(): { [key: number]: Experiment } {
    const result: { [key: number]: Experiment } = {};

    ExperimentsHelper.supportedExperiments.forEach(ExpClass => {
      const instance = new ExpClass();
      result[instance.expNumber] = instance;
    });

    return result;
  }

  public async getEngagedEnabledExpvarid(): Promise<string | null> {
    const experimentInstances = Object.values(this.experimentInstances());

    const variantsPromises = experimentInstances.map(async (experiment) => {
      const variant = await experiment.getVariant();
      return {
        experiment,
        variant
      } as ExperimentWithVariant;
    });

    const results = await Promise.all(variantsPromises);

    const engagedExperiments = results.filter(result => result.variant !== null)

    if (engagedExperiments.length === 0) {
      return null;
    }

    const engagedExperimentsStrings = engagedExperiments
      .map(result => `exp_${result.experiment.expNumber}_${result.variant}`)
      .join(',');

    log('ExperimentsHelper', `Engaged experiments string: ${engagedExperimentsStrings}`);

    return engagedExperimentsStrings;
  }
}

export const experimentsHelper = new ExperimentsHelper();
