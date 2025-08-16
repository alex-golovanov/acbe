declare module 'autoprefixer' {
  declare module.exports: ( options: {|
    'remove'?: boolean,
    'browsers'?: Array<string>
  |} ) => Object
}
