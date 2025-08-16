declare type SiteFilterDomain = {
  country: string;
  disabled?: boolean;
  format: 'domain';
  proxyMode: boolean;
  value: string;
};

declare type SiteFilterFullDomain = {
  country: string;
  disabled?: boolean;
  format: 'full domain';
  proxyMode: boolean;
  value: string;
};

declare type SiteFilterRegex = {
  country: string;
  disabled?: boolean;
  format: 'regex';
  proxyMode: boolean;
  value: RegExp;
};

declare type SiteFilter =
  | SiteFilterDomain
  | SiteFilterFullDomain
  | SiteFilterRegex;

export type {
  SiteFilter,
  SiteFilterDomain,
  SiteFilterFullDomain,
  SiteFilterRegex,
};
