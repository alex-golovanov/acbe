declare module 'webpack-stream' {
  declare module.exports: (
    (
      arg1: {|
        'config'?: {|
          'entry'?: string | string[] | { [ string ]: string },
          'mode'?: 'none',
          'module'?: {|
            'rules'?: Array<{|
              'test'?: RegExp,
              'use'?: {|
                'loader'?: 'babel-loader',
                'options'?: Object
              |}
            |}>
          |},
          'resolve'?: {|
            'extensions'?: string[],
            'modules'?: string[],
            'alias'?: { [ string ]: string }
          |},
          'output'?: {|
            'filename'?: ( pathData: any, assetInfo: any ) => string
          |},
          'optimization'?: {|
            'splitChunks'?: {|
              'chunks'?: 'all',
              'name'?: string
            |}
          |}
        |} 
      |}
    ) => stream$Writable
  ) & {
    'webpack': {|
      'DefinePlugin': ( arg1: { [ string ]: string } ) => void,
      'IgnorePlugin': ( arg1: {|
        'checkResource': ( resource: string, context: string ) => boolean
      |} ) => void
    |}
  }
}