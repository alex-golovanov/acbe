declare type AccountSubscription = {
  'auto_renewal': boolean,
  'paidUntil': string | null,
  'state': 'active' | 'expired'
};