/* global PingSortedServer, ProxyServers */
type ServerLoadItem = {
  'country': string,
  'premium': boolean,
  'serverLoad': number
};


const serverLoad: readonly ServerLoadItem[] = Object.freeze( [
  { 'country': 'nl', 'premium': false, 'serverLoad': 0.5 },
  { 'country': 'sg', 'premium': false, 'serverLoad': 0.5 },
  { 'country': 'uk', 'premium': false, 'serverLoad': 0.5 },
  { 'country': 'us', 'premium': false, 'serverLoad': 0.5 },
] );


/** @function */
export default (
  { proxyServers }: { 'proxyServers': ProxyServers }
): PingSortedServer[] => {
  const output: PingSortedServer[] = [];

  for( const [ country, { free, premium } ] of proxyServers ) {
    if( premium ) {
      const load/*: number*/ =
        serverLoad.find( ({ 'country': ownCountry, premium }) => (
          ownCountry === country && premium
        ) )?.serverLoad || 1;

      output.push({
        country,
        'premium': true,
        'serverLoad': load,
        'hosts': premium.map(({ host }) => host )
      });
    }

    if( free ) {
      const load/*: number*/ =
        serverLoad.find( ({ 'country': ownCountry, premium }) => (
          ownCountry === country && !premium
        ) )?.serverLoad || 1;

      output.push({
        country,
        'premium': false,
        'serverLoad': load,
        'hosts': free.map(({ host }) => host )
      });
    }
  }

  return output;
};
