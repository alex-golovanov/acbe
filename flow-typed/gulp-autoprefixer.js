declare module 'gulp-autoprefixer' {
  declare module.exports: ( options?: {|
    'browsers'?: Array<string>,
    'remove'?: boolean
  |} ) => stream$Duplex
}
