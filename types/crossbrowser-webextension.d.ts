declare module 'crossbrowser-webextension' {
  const extension: {
    'alarms': {
      'clear': ( name: string ) => Promise<boolean>,
      'clearAll': () => Promise<boolean>,
      'create': (
        name: string,
        alarmInfo?: {
          'when'?: number, 'delayInMinutes'?: number, 'periodInMinutes'?: number
        }
      ) => void,
      'get': ( name: string ) => Promise<Alarm | undefined>,
      'getAll': () => Promise<Alarm[]>,

      'onAlarm': {
        'addListener': (
          listener: ( arg: { 'name': string } ) => any
        ) => void,
        'hasListener': (
          listener: ( arg: { 'name': string } ) => any
        ) => boolean,
        'removeListener': (
          listener: ( arg: { 'name': string } ) => any
        ) => void
      }
    },
    'browserAction': {
      'setBadgeBackgroundColor': (
        details: string | { 'color': string }
      ) => undefined,
      'setBadgeText': (
        details: string | { 'text': string }
      ) => undefined,
      'setIcon': ( details: {
        'path'?: { [ key: string ]: string | undefined } | string
      }) => Promise<void>,
      'removeBadgeText': () => void
    },
    'browsingData': {
      'remove': (
        options: {
          'origins'?: string[]
        },
        dataToRemove: {
          'appcache'?: boolean,
          'cache'?: boolean,
          'cacheStorage'?: boolean,
          'serviceWorkers'?: boolean
        }
      ) => void
    },
    'extension': {
      'getViews': ( options: { 'type'?: 'tab' }) => Window[]
    },
    'i18n': {
      'getUILanguage': () => string
    },
    'permissions': {
      'getAll': () => Promise<{ 'permissions': string[] }>,
      'onAdded': {
        'addListener': (
          listener: ( permissionsObject: { 'permissions': string[] }) => any 
        ) => void
      },
      'onRemoved': {
        'addListener': (
          listener: ( permissionsObject: { 'permissions': string[] }) => any 
        ) => void
      },
      'request': ( permissions: {
        'origins'?: string[],
        'permissions'?: string[]
      }) => Promise<boolean> 
    },
    'privacy': {
      'network': {
        'webRTCIPHandlingPolicy': {
          'get': () => Promise<{ 'levelOfControl': string }>,
          'set': ( arg: { 'value': any }) => Promise<any>
        }
      }
    },
    'proxy': {
      'onError': {
        'addListener': ( listener: ( error: any ) => any ) => void
      },
      'onRequest': { // FF only
        'addListener': (
          listener: ( details: {
            'cookieStoreId': string,
            'documentUrl': string,
            'frameId': integer,
            'fromCache': boolean,
            'incognito': boolean,
            'method': string,
            'originUrl': string,
            'parentFrameId': integer,
            'requestId': string,
            'tabId': integer,
            'thirdParty': boolean,
            'timeStamp': number,
            'url': string
          }) => ProxyProxyinfo | ProxyProxyinfo[] | Promise<ProxyProxyinfo | ProxyProxyinfo[]>,
          filter: WebRequestRequestFilter
        ) => void
      },
      'register': ( url: string ) => Promise<void>,
      'registerProxyScript': ( url: string ) => Promise<void>,
      'settings': { // Chrome only
        'clear': (
          options: { 'scope': ExtensionSettingsScope }
        ) => Promise<void>,
        'get': (
          options: { 'incognito'?: boolean } 
        ) => Promise<{ 'levelOfControl': LevelOfControl, 'value': { 'pacScript': { 'data': string } } }>,
        'onChange': {
          'addListener': (
            listener: ( details: { 'levelOfControl': LevelOfControl }) => any
          ) => void
        },
        'set': ( options: {
          'scope': ExtensionSettingsScope,
          'value': {
            'mode': 'pac_script',
            'pacScript': {
              'data': string
            }
          }
        }) => Promise<void>
      }
    },
    'resetAPI': ( api: string ) => void,
    'runtime': {
      'connect': (
        connectInfo?: { 'name'?: string } 
      ) => RuntimePort
      'getBrowserInfo': () => Promise<{
        'name': string,
        'vendor': string,
        'version': string,
        'buildID': string
      }>,
      'getManifest': () => ({
        'current_locale': string,
        'manifest_version': 2 | 3,
        'permissions': string[],
        'version': string
      }),
      'getURL': ( url: string ) => string,
      'id': string,
      'onConnect': {
        'addListener': (
          listener: ( port: RuntimePort ) => any
        ) => void
      },
      'onInstalled': {
        'addListener': (
          listener: (
            details: {
              'reason': 'install'
            } | {
              'reason': 'update',
              'previousVersion': string
            }
          ) => any
        ) => void
      },
      'onMessage': {
        'addListener': ( listener: (
          message: any,
          sender: RuntimeMessageSender
        ) => any ) => void
      },
      'onStartup': {
        'addListener': ( listener: () => any ) => void
      },
      'sendMessage': (
        message: any,
        options?: { 'toProxyScript'?: true }
      ) => Promise<any>,
      'setUninstallURL': ( url: string ) => Promise<void>
    },
    'storage': {
      'local': {
        'get': ( arg?: string | string[] | null ) => Promise<any>,
        'getBytesInUse': ( keys: string | string[] ) => Promise<integer>,
        'set': ( arg: { [ key: string ]: any }) => Promise<void>,
        'remove': ( arg: string | string[] ) => Promise<void>
      },
      'onChanged': {
        'addListener': (
          listener: (
            changes: StorageChange, area: 'local' | 'managed' | 'sync'
          ) => any 
        ) => void,
        'removeListener': (
          listener: (
            changes: StorageChange, area: 'local' | 'managed' | 'sync'
          ) => any 
        ) => void
      }
    },
    'tabs': {
      'create': (
        createProperties: {
          'active'?: boolean,
          'url'?: string
        } | string 
      ) => Promise<Tab>,
      'executeScript': (
        tabId?: integer,
        details: {
          'file'?: string
        }
      ) => Promise<any[]>,
      'get': ( tabId: integer ) => Promise<Tab>
      'onActivated': {
        'addListener': (
          listener: (
            activeInfo: { tabId: integer, windowId: integer, previousTabId: integer }
          ) => any
        ) => void
      },
      'onUpdated': {
        'addListener': (
          listener: TabsOnUpdatedListener
        ) => void,
        'removeListener': (
          listener: TabsOnUpdatedListener
        ) => void
      },
      'reload': ( tabId: number ) => Promise<void>,
      'remove': ( ids: number[] ) => Promise<void>,
      'sendMessage': ( tabId: integer, message: any ) => Promise<any>,
      'query': (
        queryObj?: {
          'active'?: boolean, 
          'currentWindow'?: boolean, 
          'url'?: string,
          'windowId'?: integer
        }
      ) => Promise<Tab[]>,
      'update': (
        tabId: integer, 
        updateProperties: {
          'active'?: boolean,
          'highlighted'?: boolean,
          'url'?: string
        }
      ) => Promise<Tab>
    },
    'webRequest': {
      'onAuthRequired': {
        'addListener': (
          listener: ( details: OnAuthRequiredDetails ) => any,
          filter: WebRequestRequestFilter | string,
          extraInfoSpec?: string[]
        ) => void
      },
      'onBeforeRequest': {
        'addListener': (
          listener: ( details: OnBeforeRequestDetails ) => any,
          filter: WebRequestRequestFilter | string,
          extraInfoSpec?: string[]
        ) => void,
        'removeListener': ( listener: ( details: OnBeforeRequestDetails ) => any ) => void
      },
      'onBeforeSendHeaders': {
        'addListener': (
          listener: ( details: OnBeforeSendHeadersDetails ) => any,
          filter: WebRequestRequestFilter | string,
          extraInfoSpec?: string[]
        ) => void
      }
      'onCompleted': {
        'addListener': (
          listener: ( details: OnCompleteDetails ) => any,
          filter: WebRequestRequestFilter | string,
          extraInfoSpec?: string[]
        ) => void
      },
      'onErrorOccurred': {
        'addListener': (
          listener: ( details: OnErrorOccurredDetails ) => any,
          filter: WebRequestRequestFilter
        ) => void,
        'removeListener': (
          listener: ( details: OnErrorOccurredDetails ) => any
        ) => void
      },
      'onHeadersReceived': {
        'addListener': (
          listener: ( details: OnHeadersReceivedDetails ) => any,
          filter: WebRequestRequestFilter | string,
          extraInfoSpec?: string[]
        ) => void
      }
    },
    'windows': {
      'getCurrent': ( getInfo?: { 'populate'?: boolean } ) => Promise<{ 'tabs': Tab[] }>,
      'onFocusChanged': {
        'addListener': (
          listener: ( windowId: integer ) => any
        ) => void
      }
    }
  };

  export default extension;
}