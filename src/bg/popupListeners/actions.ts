import actions from 'bg/actions';
import account from 'bg/account';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'callback': ({ country }/*: { 'country': string }*/ ) => {
    return actions.favorites.add( country );
  },
  'type': 'actions.favorites.add',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': ({ country }/*: { 'country': string }*/ ) => {
    return actions.favorites.remove( country );
  },
  'type': 'actions.favorites.remove',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': async(
    { 'data': { email, password } }/*:
    { 'data': { 'email': string, 'password': string } }*/
  ) => {
    try {
      let account = await actions.login({ email, password });
      return { 'success': account };
    }
    catch ( error ) {
      let { status, responseText, message } = error;
      return { 'error': { status, responseText, message } };
    }
  },
  'type': 'actions.login',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': () => actions.logout(),
  'type': 'actions.logout',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  callback: async () => {
    const acc = await account.reload();
    return {...acc, loaded: true};
  },
  type: 'account.reload',
  popupOnly: true,
});
