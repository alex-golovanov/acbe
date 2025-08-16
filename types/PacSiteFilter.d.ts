declare type PacSiteFilter = {
  format: 'domain' | 'full domain' | 'regex';
  value: string;
  country: string | undefined; // void if DIRECT
};

export type { PacSiteFilter };
