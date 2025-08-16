declare type Tab = {
  'active': boolean,
  'id': integer,
  'status'?: 'loading' | 'complete',
  'url': string | undefined
};