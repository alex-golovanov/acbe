declare module 'postcss' {
  declare module.exports: ( options: Array<Object> ) => {|
    'process': ( rules: string ) => {|
      'css': string
    |}
  |}
}
