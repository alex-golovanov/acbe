/* global HostPing, PingCountryAverage, PingSortedServer */
type CountryDelays = {
  'country': string,
  'delays': number[],
  'premium': boolean
};


/** Convert host-based ping data to country-based ping data
@function */
export default (
  { servers, 'pings': prePings }:
  { 'servers': PingSortedServer[], 'pings': HostPing[] }
): PingCountryAverage[] => {
  const pings: Array<{ 'host': string, 'delay': number }> = [];
  for( const { host, valid, delay } of prePings ) {
    if( valid && delay ) pings.push({ host, delay });
  }

  // Get delays per country
  const countryDelays: CountryDelays[] = [];
  for( const { country, premium, hosts } of servers ) {
    const delays: number[] = [];
    for( const host of hosts ) {
      const delay = pings.find( ping => ping.host === host )?.delay;
      if( delay ) delays.push( delay );
    }

    if( delays.length ) countryDelays.push({ country, premium, delays });
  }

  // Remove most bad 10% of delays per each country
  return countryDelays.map( ({ country, premium, delays }) => {
    if( delays.length === 1 ) {
      return { country, premium, 'delay': delays[ 0 ] };
    }

    let cropLimit/*: integer*/ = Math.floor( delays.length * 0.1 ) || 1;

    delays = delays.sort( ( a, b ) => a - b )
      .slice( 0, delays.length - cropLimit );

    let delay/*: integer*/ = Math.round(
      delays.reduce( ( carry, value ) => carry + value, 0 ) / delays.length
    );

    return { country, premium, delay };
  });
};
