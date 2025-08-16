import LocalDelayRecord from 'LocalDelayRecord';
import store from 'store';
import userProperties from 'userProperties';


export default () => {
  // Send every smart settings change to server
  store.onChange(
    ({ userPac }) => userPac.filters,
    async( filters, x, storeState ) => {
      const credentials = storeState.user?.loginData?.credentials;
      if( !credentials ) return;

      const oldSupportFilters = filters.map( base => Object.assign(
        {},
        base,
        { 'domain': base.value.toString() } // Support of old clients after migrtion
      ) );

      const timer = new LocalDelayRecord( 'Set smart settings' );
      await userProperties.saveSmartSettings(
        { credentials, 'filters': oldSupportFilters }
      ).finally( () => {
        timer.end();
      });
    }
  );
};
