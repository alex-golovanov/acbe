import runtimeOnMessage from 'bg/runtime.onMessage';
import store from 'store';


runtimeOnMessage.addListener({
  'callback': async() => {
    const state: any = Object.assign({}, await store.getStateAsync() );
    for( const key of Object.keys( state ) ) {
      const initialValue = state[ key ];
      if( initialValue instanceof Map ) state[ key ] = Object.fromEntries( initialValue );
    }

    return state;
  },
  'type': 'store: get state',
  'popupOnly': true
});
