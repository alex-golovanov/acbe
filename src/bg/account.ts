/* global StoreAccount */
import ajaxes from 'ajaxes';
import config from 'config';
import DelayRecord from 'DelayRecord';
import ga from 'ga';
import hideAjaxAccountData from 'tools/hideAjaxAccountData';
import hideStoreAccountData from 'tools/hideStoreAccountData';
import log from 'log';
import store from 'store';
import time from 'time';
import availableServer from 'availableServer';


/** Direct load of account without any delay
@function */
const directLoad = async(): Promise<StoreAccount> => {
  const timer = new DelayRecord( 'Account direct load' );
  const { user } = await store.getStateAsync();

  if( config.type === 'development' ) log( 'AJAX: /account' );

  return (
    ajaxes.account( user.loginData?.credentials )
      .finally( () => { timer.end(); })
      .then(
        data => {
          log( 'ajaxes.account', 'data', hideAjaxAccountData( data ) );

          store.dispatch({ 'type': 'User: set', data });

          return store.getStateSync().user; // With validUntil!
        },
        error => {
          ga.partial({
            'category': 'error',
            'action': 'browsec.account',
            'label': JSON.stringify({ 'status': error.message, error })
          });

          log.warn( 'Account load error: ', error );
          return Promise.reject( error );
        }
      )
  );
};


/** Load with check of user data change
@function */
const loadWithCheck = async(
  delayRecordName: string = 'Account load'
): Promise<StoreAccount> => {
  await availableServer.initialRequestComplete;

  const timer = new DelayRecord( delayRecordName );
  const { 'user': oldAccount } = await store.getStateAsync();

  return ajaxes.account( oldAccount.loginData?.credentials )
    .finally( () => { timer.end(); })
    .then(
      async newAccount => {
        log( 'ajaxes.account', 'data', hideAjaxAccountData( newAccount ) );

        const { user } = await store.getStateAsync();
        if( user === oldAccount ) { // If old account not changed
          store.dispatch({ 'type': 'User: set', 'data': newAccount });
        }

        return ( await store.getStateAsync() ).user; // With .validUntil !
      },
      error => {
        ga.partial({
          'category': 'error',
          'action': 'browsec.account',
          'label': JSON.stringify({ 'status': error.message, error })
        });

        log.warn( 'Account load error: ', error );
        return Promise.reject( error );
      }
    );
};


/** Load account data from local storage and ... (async function)
@function */
const load = async(): Promise<StoreAccount> => {
  let { 'user': account } = await store.getStateAsync();

  // Does property .validUntil valid and not expired? true = yes
  const validAccount: boolean =
    typeof account.timestamp.validUntil === 'number'
    && account.timestamp.validUntil >= Date.now();
  if( validAccount ) return account;

  if( account.type === 'logined' ) {
    log( 'revalidating invalid account, ', hideStoreAccountData( account ) );
    log(
      'Account load: current=%o fetched=%o',
      account.timestamp.version,
      hideStoreAccountData( account )
    );
  }

  // In case of guest used to make autologin through site cookies
  return loadWithCheck( 'Account load' );
};


/** Used in external management of this extension
@function */
const reload = async(): Promise<StoreAccount> => {
  try {
    return await loadWithCheck( 'Account reload' );
  }
  catch ( error ) {
    log.error( 'failed to load account', error );

    store.dispatch({
      'type': 'User: set',
      'data': { 'guest': true, 'type': 'guest' }
    });

    throw error;
  }
};


// Update every 24 hours
time.onStart({
  'name': 'account load loop',
  'repeatInMinutes': 24 * 60
}, loadWithCheck );


export default { directLoad, load, reload };
