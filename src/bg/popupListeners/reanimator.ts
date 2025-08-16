/* global Tab */
import availableServer, { getAndSaveApiDomainsList } from 'availableServer';
import Browser from 'crossbrowser-webextension';
import proxy from 'proxy';
import runtimeOnMessage from 'bg/runtime.onMessage';
import storage from 'storage';
import { getDataAndUpdateServers } from 'bg/serversObject';
import { updateDynamicConfig } from 'bg/dynamicConfig';


runtimeOnMessage.addListener({
  'callback': async() => {
    const returnPromise = storage.set({
      'reanimator: step': 1,
      'reanimator: in progress': true
    });

    ( async() => {
      await returnPromise;

      try {
        await updateDynamicConfig();
      }
      catch ( x ) {
        console.error( x );
      }

      await storage.set( 'reanimator: step', 2 );

      try {
        await getAndSaveApiDomainsList();
      }
      catch ( x ) {
        console.error( x );
      }

      await storage.set( 'reanimator: step', 3 );

      await availableServer.restart();

      await storage.set( 'reanimator: step', 4 );

      try {
        await getDataAndUpdateServers();
      }
      catch ( x ) {
        console.error( x );
      }

      await storage.set( 'reanimator: step', 5 );

      await proxy.setFromStore();

      try {
        // Get current active window
        const windowInfo = await Browser.windows.getCurrent({ 'populate': true });

        // Get active tab
        const activeTab: Tab | undefined = windowInfo.tabs.find( ( tab ) => tab.active );

        if( activeTab ) await Browser.tabs.reload( activeTab.id );
      }
      catch ( x ) {}

      await storage.set( 'reanimator: in progress', false );
    })();

    return returnPromise;
  },
  'type': 'reanimator: activate',
  'popupOnly': true
});
