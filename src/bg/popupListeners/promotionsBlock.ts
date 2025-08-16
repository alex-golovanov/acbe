import ajaxes from 'ajaxes';
import runtimeOnMessage from 'bg/runtime.onMessage';
import store from 'store';


runtimeOnMessage.addListener({
  'callback': ({ value }: { value: boolean }) => {
    store.dispatch({ 'type': 'Promotions block: set', 'data': value });
    const { user } = store.getStateSync();
    if( user.type === 'guest' ) return;

    ajaxes.setPromotionsBlock({
      'credentials': user.loginData.credentials,
      'promotionsBlock': value
    });
  },
  'type': 'promotionsBlock.set',
  'popupOnly': true
});
