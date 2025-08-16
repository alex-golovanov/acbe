declare type Tariff = {
  'kind': string,
  'prices': Array<{
    'currency': string,
    'value': number,
    'oldValue'?: number
  }>,
  'duration': integer // in months
};
