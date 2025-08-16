/* global DiagnosticsStepState */
import Browser from 'crossbrowser-webextension';
import Diagnostics from 'bg/Diagnostics';
import permissions from 'bg/permissions';
import store from 'store';


Browser.runtime.onConnect.addListener( ( port ) => {
  switch( port.name ) {
    case 'diagnostics': {
      /** @function */
      const listener = ( data: DiagnosticsStepState[] ) => {
        port.postMessage( data );
      };

      Diagnostics.addListener( listener );
      port.onDisconnect.addListener( () => {
        Diagnostics.removeListener( listener );
      });
      break;
    }

    case 'permissions': {
      /** @function */
      const listener = ( permissions: string[] ) => {
        port.postMessage( permissions );
      };

      permissions.addListener( listener );
      port.onDisconnect.addListener( () => {
        permissions.removeListener( listener );
      });
      break;
    }

    case 'store': {
      const unsubscribe/*: Function*/ = store.subscribe( () => {
        let state = store.getStateSync();
        port.postMessage( state );
      });

      port.onDisconnect.addListener( () => {
        unsubscribe();
      });
      break;
    }
  }
});
