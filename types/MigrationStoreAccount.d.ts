declare type MigrationStoreAccountGuest = {
  'guest': true,
  'premium': false,
  'validUntil': integer, // timestamp in format Date.now()
  'version': integer // timestamp (JUNK)
};
declare type MigrationStoreAccountLogined = {
  'credentials': Credentials,
  'email': string,
  'id': string,
  'premium': true,
  'subscription': AccountSubscription,
  'validUntil': integer, // timestamp in format Date.now()
  'version': integer // timestamp (JUNK)
};

declare type MigrationStoreAccount = 
  MigrationStoreAccountGuest | 
  MigrationStoreAccountLogined;
