declare module 'js-beautify' {
  declare module.exports: {
    js_beautify(
      code: string,
      options?: {|
        'brace-style'?: 'collapse',
        'indent_size'?: integer
      |}
    ): string;

  }
}
