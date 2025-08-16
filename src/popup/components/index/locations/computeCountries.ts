/* global LocationsRenderServerData, PingRating, StoreState */
export default (
  state: StoreState,
  countryNameByCode: ( code: string ) => string,
  language: string = 'en'
): LocationsRenderServerData[] => {
  const { favorites, ping, proxyServers, user } = state;

  const premiumUser = user.premium;

  // List of servers
  const list: LocationsRenderServerData[] = [];
  for( const [ countryCode, countryData ] of proxyServers ) {
    const name: string = countryNameByCode( countryCode );

    // Free servers
    if( !premiumUser ) {
      const servers = countryData.free;

      if( Array.isArray( servers ) && servers.length ) {
        const data: LocationsRenderServerData = {
          'id': countryCode,
          'code': countryCode,
          name,
          'premium': false
        };

        const delayData: PingRating | undefined = ping.find(
          ({ country, premium }) => country === countryCode && !premium
        );
        if( delayData ) {
          const { delay, mark } = delayData;
          Object.assign( data, { delay, mark });
        }

        list.push( data );
      }
    }

    { // Premium servers
      const servers = countryData.premium;

      if( Array.isArray( servers ) && servers.length ) {
        const data: LocationsRenderServerData = {
          'id': countryCode + '_premium',
          'code': countryCode,
          'name': name + ( language === 'en' ? ' (Premium)' : ' (Премиум)' ),
          'premium': true
        };
        if( premiumUser ) data.favorited = favorites.includes( countryCode );

        const delayData: PingRating | undefined = ping.find(
          ({ country, premium }) => country === countryCode && premium
        );
        if( delayData ) {
          const { delay, mark } = delayData;
          Object.assign( data, { delay, mark });
        }

        list.push( data );
      }
    }
  }

  return list.sort( ( a, b ) => {
    // Favorited state
    if( Boolean( a.favorited ) !== Boolean( b.favorited ) ) {
      return a.favorited ? -1 : 1;
    }

    // Premium state
    if( a.premium !== b.premium ) return a.premium ? 1 : -1;

    // Name
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if( nameA < nameB ) return -1;
    if( nameA > nameB ) return 1;
    return 0;
  });
};
