declare module 'decompress' {
  declare module.exports: (
    input: string,
    output: string,
    options?: {|
      filter?: Function,
      map?: Function,
      plugins?: Array<any>,
      strip?: integer
    |}
  ) => Promise<any>
}
