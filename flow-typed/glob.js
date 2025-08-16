declare function globCrap(
  urls: string | Array<string>,
  callback: ( error: Error | null, files: Array<string> ) => any
): void;
declare function globCrap(
  urls: string | Array<string>,
  options?: Object,
  callback: ( error: Error | null, files: Array<string> ) => any
): void;


declare module 'glob' {
  declare module.exports: typeof globCrap & {|
    'hasMagic': ( urls: string ) => boolean
  |}
}
