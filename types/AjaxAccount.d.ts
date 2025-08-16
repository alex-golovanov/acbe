declare type LoginedAjaxAccount = {
  'credentials': Credentials,
  'email': string,
  'id': string,
  'premium': boolean,
  'subscription': AccountSubscription,
  'type': 'logined'
};
declare type GuestAjaxAccount = {
  'guest': true,
  'type': 'guest'
};

declare type AjaxAccount = LoginedAjaxAccount | GuestAjaxAccount;