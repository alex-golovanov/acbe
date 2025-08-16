declare type VinylFile = {|
  'contents': Buffer, //  | null
  'isBuffer': () => boolean,
  'base': string,
  'basename': string,
  'path': string,
  'relative': string
|};
