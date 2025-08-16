export interface ExperimentConfig {
  enabled: boolean;
  distribution: number[];
  [key: string]: any;
}

export interface ExperimentEngagementData {
  engagedAt: Date;
  variant: number;
  configWhenEngaged: ExperimentConfig;
}
