/* global Credentials, DeclarativeNetRequestRule */
import config from 'config';
import encodeTokenCredentials from 'tools/encodeTokenCredentials';
import store from 'store';
import onStartAction from 'bg/onStartAction';


const manifestVersion = chrome.runtime.getManifest().manifest_version;


/** @function */
const setRules = async( credentials: Credentials | undefined ) => {
  if( !credentials ) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      'removeRuleIds': [ 2, 3, 4 ]
    });
    return;
  }

  const rules: DeclarativeNetRequestRule[] =
    await chrome.declarativeNetRequest.getDynamicRules();
  if( rules.some( ({ id }) => id === 2 ) ) return;

  await chrome.declarativeNetRequest.updateDynamicRules({
    'addRules': [
      {
        'id': 2,
        'priority': 1,
        'action': {
          'type': 'modifyHeaders',
          'requestHeaders': [
            {
              'header': 'Authorization',
              'operation': 'set',
              'value': encodeTokenCredentials( credentials )
            }
          ]
        },
        'condition': {
          'regexFilter': `^${config.baseUrl.replace( /\./g, '\\.' )}/.*`,
          'resourceTypes': [ 'main_frame', 'sub_frame', 'xmlhttprequest' ]
        }
      },
      // don't know why this rule is needed
      //
      // {
      //   'id': 3,
      //   'priority': 2,
      //   'action': {
      //     'type': 'modifyHeaders',
      //     'requestHeaders': [
      //       {
      //         'header': 'Authorization',
      //         'operation': 'remove'
      //       }
      //     ]
      //   },
      //   'condition': {
      //     'regexFilter': `^${config.baseUrl.replace( /\./g, '\\.' )}/api/.*`,
      //     'resourceTypes': [ 'main_frame', 'sub_frame', 'xmlhttprequest' ]
      //   }
      // },
      {
        'id': 4,
        'priority': 2,
        'action': {
          'type': 'modifyHeaders',
          'requestHeaders': [
            {
              'header': 'Authorization',
              'operation': 'remove'
            }
          ]
        },
        'condition': {
          'regexFilter': `^${config.baseUrl.replace( /\./g, '\\.' )}/assets/.*`,
          'resourceTypes': [ 'main_frame', 'sub_frame', 'xmlhttprequest' ]
        }
      }
    ]
  });
};


( () => {
  if( manifestVersion !== 3 ) return;

  // On status change
  store.onChange(
    ({ user }) => user.loginData?.credentials,
    credentials => { setRules( credentials ); }
  );

  onStartAction( async() => {
    // Initial
    const storeState = await store.getStateAsync();
    setRules( storeState.user.loginData?.credentials );
  });
})();
