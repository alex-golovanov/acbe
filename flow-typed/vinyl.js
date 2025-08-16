class Vinyl{
  constructor( options?: {|
    'base'?: string,
    'basename'?: string,
    'path'?: string,
    'contents': Buffer | stream$Duplex
  |} ){}
};


declare module 'vinyl' {
  declare module.exports: typeof Vinyl
}
