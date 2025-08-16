declare module 'gulp' {
  declare module.exports: {
    dest( path: string ): stream$Duplex;
    src(
      globs: string | Array<string>,
      options?: {|
        'base'?: string
      |}
    ): stream$Duplex;
    parallel(
      ...args: Array<string | GulpComposedOperation>
    ): GulpComposedOperation;
    series(
      ...args: Array<string | GulpComposedOperation>
    ): GulpComposedOperation;
    task( taskName: string, action: Function | GulpComposedOperation ): void;
  }
}
