/* global Credentials */
import ajaxes from 'ajaxes';
import store from 'store';


export default {
  /** @method */
  'get': (): boolean => store.getStateSync().timezoneChange,

  /** @method */
  'set': ( value: boolean ): void => {
    store.dispatch({ 'type': 'Timezone change: set', 'data': value });

    const { user } = store.getStateSync();
    const premium: boolean = user.premium;
    const credentials: Credentials | undefined = user.loginData?.credentials;
    if( !credentials || !premium ) return;

    ajaxes.setTimezoneChange({ credentials, 'timezoneChange': value });
  }
};


