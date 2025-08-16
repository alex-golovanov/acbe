/* global ProxyServerCountryData */
export default ( proxyServers: Map<string, ProxyServerCountryData> ) => (
  Object.assign(
    proxyServers,

    {
      /** @method */
      freeCountries(): Iterable<string> {
        const iterator = // @ts-ignore
          ( this as Map<string, ProxyServerCountryData> ).entries();
        
        return {
          [ Symbol.iterator ]: () => ({
            next() {
              while( true ) {
                const { value, done } = iterator.next();
                if( done ) return { 'value': undefined, 'done': true };
                
                let [ country, { 'free': servers } ] = value;
                if( servers ) return { 'value': country, 'done': false };
              }
            }
          })
        };
      },

      /** @method */
      premiumCountries(): Iterable<string> {
        const iterator = // @ts-ignore
          ( this as Map<string, ProxyServerCountryData> ).entries();

        return {
          [ Symbol.iterator ]: () => ({
            next() {
              while( true ) {
                const { value, done } = iterator.next();
                if( done ) return { 'value': undefined, 'done': true };

                let [ country, { 'premium': servers } ] = value;
                if( servers ) return { 'value': country, 'done': false };
              }
            }
          })
        };
      }
    }
  )
);
