import storage from 'storage';


export default async(): Promise<{ [ key: string ]: integer }> => {
  let statisticsState: { [ key: string ]: integer } | void =
    await storage.get( 'statistics' );
  if( !statisticsState ) return {};

  return {
    // Count of location country changes
    'country changes': statisticsState.countryChanges || 0,

    // Number of clicks on browser icon
    'icon clicks': statisticsState.iconClicks || 0,

    // Count of transitions to location page
    'popup: location page shows': statisticsState.locationPageShows || 0,

    // Global proxy ON click times
    'popup: proxy on': statisticsState.proxyOn || 0,

    // Count of successfully loaded proxied pages
    'proxied pages': statisticsState.proxiedPages || 0,

    // Count of proxy.onError errors
    'proxy errors': statisticsState.proxyErrors || 0,

    // How much times user successfully logined
    'user login': statisticsState.userLoginCount || 0
  };
};
