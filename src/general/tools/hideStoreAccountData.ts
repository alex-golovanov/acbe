/* global StoreAccount */
import config from 'config';


const emailValue = '--@--.--';

/** @function */
let development = ( account: StoreAccount ): StoreAccount => account;

/** @function */
let production = ( base: StoreAccount ): StoreAccount => {
  let account = JSON.parse( JSON.stringify( base ) );

  if( account.type === 'logined' ) {
    account.email = emailValue;
    account.loginData.credentials.email = emailValue;
    account.loginData.credentials.access_token = 'exist';
    account.loginData.credentials.ipsec_password = 'exist';
    account.loginData.credentials.xray_uuid = 'exist';
  }

  return account;
};


/** @function */
export default config.type === 'development' ? development : production;
