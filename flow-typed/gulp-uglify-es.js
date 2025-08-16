declare type GulpUglifyOptions = {|
  'compress'?: {|
    'arrows'?: boolean,
    'arguments'?: boolean,
    'booleans'?: boolean,
    'booleans_as_integers'?: boolean,
    'collapse_vars'?: boolean,
    'comparisons'?: boolean,
    'computed_props'?: boolean,
    'conditionals'?: boolean,
    'dead_code'?: boolean,
    'defaults'?: boolean,
    'directives'?: boolean,
    'drop_console'?: boolean,
    'drop_debugger'?: boolean,
    'ecma'?: 5,
    'evaluate'?: boolean,
    'expression'?: boolean,
    'global_defs'?: {},
    'hoist_funs'?: boolean,
    'hoist_props'?: true,
    'hoist_vars'?: boolean,
    'if_return'?: boolean,
    'inline'?: boolean,
    'join_vars'?: boolean,
    'keep_classnames'?: boolean,
    'keep_fargs'?: boolean,
    'keep_fnames'?: boolean,
    'keep_infinity'?: boolean,
    'loops'?: boolean,
    'module'?: boolean,
    'negate_iife'?: boolean,
    'passes'?: integer,
    'properties'?: boolean,
    'pure_funcs'?: null,
    'pure_getters'?: 'strict',
    'reduce_vars'?: boolean,
    'sequences'?: boolean,
    'side_effects'?: boolean,
    'switches'?: boolean,
    'toplevel'?: boolean,
    'top_retain'?: boolean,
    'typeofs'?: boolean,
    'unsafe'?: boolean,
    'unsafe_arrows'?: boolean,
    'unsafe_comps'?: boolean,
    'unsafe_Function'?: boolean,
    'unsafe_math'?: boolean,
    'unsafe_methods'?: boolean,
    'unsafe_proto'?: boolean,
    'unsafe_regexp'?: boolean,
    'unsafe_undefined'?: boolean,
    'unused'?: boolean,
    'warnings'?: boolean
  |},
  'mangle'?: boolean | {}
|};


declare module 'gulp-uglify-es' {
  declare module.exports: {|
    'default': ( options?: GulpUglifyOptions ) => stream$Duplex
  |}
}
