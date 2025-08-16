import Counters from 'bg/Counters';
import storage from 'storage';
import store from 'store';


export default async(): Promise<{ [ key: string ]: integer | null | boolean }> => {
  let statistics = await storage.get( 'statistics' );
  const { user } = await store.getStateAsync();

  let state: { [ key: string ]: integer | null | boolean } =
    statistics || {
      /** days_before_uninstall - dbu - Integer count of full days from installation to removal
      @type {(integer|null)} */
      'daysLive': null,

      /** install_date - id - Installation date (UTC) in format of Date.now()
      @type {(integer|null)} - after convertion {String} in format YYYYMMDDhhmm */
      'installDate': null,

      /** logged_in - li - User is logined */
      'userLogined': Boolean( user.email )
    };

  /** changed_location_times - cl - Count of location country changes
  @type {integer} */
  state.countryChanges = await Counters.get( 'country changes' );

  /** browsec_action_clicks - bac - Number of clicks on browser icon
  @type {integer} */
  state.iconClicks = await Counters.get( 'icon clicks' );

  /** change_location_opened_times - clo - Count of transitions to locations page
  @type {integer} */
  state.locationPageShows = await Counters.get( 'popup: location page shows' );

  /** successful_resources_loaded_number - s (Old: sl) -
  Count of successfully loaded proxied pages.
  @type {integer} */
  state.proxiedPages = await Counters.get( 'proxied pages' );

  /** proxy_errors_number - pe - Count of proxy.onError errors
  @type {integer} */
  state.proxyErrors = await Counters.get( 'proxy errors' );

  /** turned_on_times - to - Global proxy ON click times
  @type {integer} */
  state.proxyOn = await Counters.get( 'popup: proxy on' );

  /** logged_in_times - lit - How much times user successfully logined
  @type {integer} */
  state.userLoginCount = await Counters.get( 'user login' );


  return state;
};
