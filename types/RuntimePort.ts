declare type RuntimePort = {
  'name': string,
  'disconnect': () => void,
  'error'?: Error
  'onDisconnect': {
    'addListener': ( listener: () => any ) => void,
    'removeListener': ( listener: () => any ) => void
  },
  'onMessage': {
    'addListener': ( listener: ( message: any ) => any ) => void,
    'removeListener': ( listener: ( message: any ) => any ) => void
  },
  'postMessage': ( message: any ) => void
};