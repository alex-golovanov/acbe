declare type ProxyServers = Map<string, ProxyServerCountryData> & {
  freeCountries: () => Iterable<string>;
  premiumCountries: () => Iterable<string>;
};

export type { ProxyServers };
