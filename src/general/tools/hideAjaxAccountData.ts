/* global AjaxAccount */
import config from 'config';


const emailValue = '--@--.--';

/** @function */
let development = ( account: AjaxAccount ): AjaxAccount => account;

/** @function */
let production = ( base: AjaxAccount ): AjaxAccount => {
  let account = JSON.parse( JSON.stringify( base ) );

  if( account.type === 'logined' ) {
    account.credentials.email = emailValue;
    account.credentials.access_token = 'exist';
    account.credentials.ipsec_password = 'exist';
  }

  return account;
};


/** @function */
export default config.type === 'development' ? development : production;
