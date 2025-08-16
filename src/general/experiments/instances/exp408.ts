import { ExperimentConfig } from '../type';
import { Experiment } from '../base';

export class Experiment408 extends Experiment {
  public static trustpilotUrl = 'https://www.trustpilot.com/evaluate/browsec.com';

  constructor() {
    super(408);
  }

  protected getDefaultConfig(): ExperimentConfig {
    return {
      enabled: false,
      distribution: [90, 10]
    };
  }
}
