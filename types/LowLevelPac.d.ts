declare type LowLevelPac = {
  browsecCountry: string | null;
  countries: { [country: string]: string[] };
  globalReturn: string | null; // country or null
  ignoredDomains: string[];
  premiumCountries: { [country: string]: string[] };
  siteFilters: PacSiteFilter[];
};

export type { LowLevelPac };
