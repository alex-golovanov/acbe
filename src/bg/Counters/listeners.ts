import store from 'store';
import { Counters } from './index';


export default async( Counters: Counters ) => {
  // Save location country changes
  store.onChange(
    ({ 'userPac': { mode, country } }) => ({ 'enabled': mode === 'proxy', country }),
    ({ enabled, 'country': newCountry }, { 'country': oldCountry }) => {
      if( !enabled ) return; // Proxy OFF
      if( newCountry === oldCountry ) return; // Same country

      Counters.increase( 'country changes' );
    }
  );

  // Count of Proxy OFF to ON
  store.onChange(
    ({ userPac }) => userPac.mode === 'proxy',
    enabled => {
      if( enabled ) Counters.increase( 'popup: proxy on' );
    }
  );

  // How much times user successfully logined
  store.onChange(
    ({ 'user': { email } }) => Boolean( email ),
    logined => {
      if( logined ) Counters.increase( 'user login' );
    }
  );
};
