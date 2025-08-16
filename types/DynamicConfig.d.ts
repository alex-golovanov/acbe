declare type DynamicConfig = {
  browsecCountry: string,
  defaultCountry: {
    premium: string,
    free: string
  },
  experiments?: {
    [key: string]: {
      enabled?: boolean,
      distribution?: number[],
    }
  },
};
