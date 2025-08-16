declare type LoginError = Error & {
  'responseText'?: string | void,
  'status'?: integer | void
};
