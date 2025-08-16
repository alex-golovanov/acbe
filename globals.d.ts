import { LoDashStatic } from 'lodash';


interface BrowserExtension{
  'action': {
    'setBadgeBackgroundColor': ( details: { 'color': string }) => undefined,
    'setBadgeText': ( details: { 'text': string }) => undefined,
    'setIcon': (
      details: {
        'path'?: { [ key: string ]: string | undefined } | string
      },
      callback?: () => any
    ) => void
  },
  'browserAction': {
    'setBadgeTextColor': ( details: { 'color': string }) => undefined
  },
  'declarativeNetRequest': {
    getDynamicRules(): Promise<DeclarativeNetRequestRule[]>,
    updateDynamicRules( options: {
      'addRules'?: DeclarativeNetRequestRule[],
      'removeRuleIds'?: number[],
    }): Promise<void>
  },
  'extension': {
    getBackgroundPage(): any | null, // BackgroundPage | null,
    getViews(
      params?: { 'type'?: string, 'windowId'?: integer }
    ): Array<Window>
  },
  'i18n': {
    'getMessage': ( property: string, substitutions?: any ) => string,
    'getUILanguage': () => string
  },
  'management': {
    'getAll': (
      callback?: ( arg: ExtensionInfo[] ) => any
    ) => Promise<ExtensionInfo[]>,
    'setEnabled': Function
  },
  'permissions': {
    'getAll': (
      callback?: ( arg: { 'permissions': string[] }) => any
    ) => Promise<{ 'permissions': string[] }>
    'request': Function
  },
  'proxy': {
    'settings': {
      'onChange': {
        'addListener': (
          listener: ( details: { levelOfControl: LevelOfControl }) => any
        ) => void
      },
      'get': (
        details: { 'incognito'?: boolean }
      ) => Promise<{ 'levelOfControl': LevelOfControl }>
    }
  },
  'runtime': {
    'connect': (
      connectInfo: { 'name'?: string, 'includeTlsChannelId'?: boolean }
    ) => RuntimePort,
    'getBrowserInfo': () => Promise<{
      'version': string
    }>,
    'getManifest': () => {
      'current_locale': string,
      'manifest_version': 2 | 3,
      'version': string
    },
    'getURL': ( url: string ) => string,
    'id': string,
    'lastError': Error | void,
    'onMessage': {
      'addListener': (
        listener: (
          message: any,
          sender: { 'id': string, 'origin': string, 'url': string },
          sendResponse: ( response: any ) => void
        ) => any
      ) => void
    },
    'sendMessage': Function,
    'setUninstallURL': ( url: string ) => any
  },
  'scripting': {
    'executeScript': ( injection: {
      'files'?: string[],
      'injectImmediately'?: boolean,
      'func'?: Function,
      'args'?: any[],
      'target': {
        'allFrames'?: boolean,
        'documentIds'?: string[],
        'frameIds'?: number[],
        'tabId': number
      }
    }) => Promise<{
      'documentId': string,
      'frameId': number,
      'result': any
    }>
  }
}


//declare var _: import( 'lodash' ).LoDashStatic;

declare global {
  interface Window {
    _: LoDashStatic;
    language: string;
  }

  var browser: BrowserExtension;
  var chrome: BrowserExtension;
  var V3: boolean;
}

//declare var browser: BrowserExtension;
//declare var chrome: BrowserExtension;
