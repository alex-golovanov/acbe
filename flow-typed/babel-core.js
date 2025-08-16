declare module '@babel/core' {
  declare module.exports: {|
    'transform': (
      content: string | Buffer,
      options?: BabelSettings
    ) => {| 'code': string |}
  |}
}
