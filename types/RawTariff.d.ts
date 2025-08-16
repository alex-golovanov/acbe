declare type RawTariff = {
  'kind': string,
  'trial_days': integer,
  /*'price': {
    'currency': string,
    'amount': number,
    'base_amount'?: number
  },*/
  'prices': {
    [ currency: string ]: {
      'amount': number,
      'base_amount'?: number
    }
  },
  'duration': {
    'unit': string,
    'qty': integer,
    'months': integer
  }
};
