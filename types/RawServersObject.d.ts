declare type RawServersObject = {
  'version': number,
  'countries': { [ country: string ]: {
    'timezoneOffset'?: integer,
    'premium_servers'?: PacHost[],
    'fast_servers'?: PacHost[],
    'servers'?: PacHost[]
  } },
  'recommended_countries': string[],
  'domains': {
    'free': string[],
    'premium': string[]
  }
};