type StoreLoginedInAccount = {
  email: string;
  loginData: {
    id: string;
    credentials: Credentials;
    subscription: AccountSubscription;
  };
  premium: boolean;
  timestamp: {
    validUntil?: integer; // timestamp in format Date.now()
    version?: integer; // timestamp (JUNK)
  };
  type: 'logined';
};
type StoreGuestAccount = {
  email: undefined;
  loginData: undefined;
  type: 'guest';
  premium: false;
  timestamp: {
    validUntil?: integer; // timestamp in format Date.now()
    version?: integer; // timestamp (JUNK)
  };
};

declare type StoreAccount = StoreLoginedInAccount | StoreGuestAccount;

export type { StoreAccount };
export type { StoreGuestAccount };
