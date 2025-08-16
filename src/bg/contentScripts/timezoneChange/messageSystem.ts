/* global SiteFilter */
import config from 'config';
import dateChange from './index';
import findMatchingFilterForDomain from 'tools/findMatchingFilterForDomain';
import onMessage from 'bg/runtime.onMessage';
import store from 'store';
import urlToDomain from 'tools/urlToDomain';
import { getDefaultCountry } from 'tools/getDefaultCountry';


onMessage.addListener({
  'type': 'date',
  'callback': async(
    { url }: { 'url': string }
  ): Promise<{ 'original': integer, 'proxy': integer | null }> => {
    const domain: string | null = urlToDomain( url );
    const {
      'userPac': { country, filters, mode },
      'proxyIsBroken': proxyBroken,
      proxyServers,
      timezones,
      'user': { 'premium': premiumUser }
    } = await store.getStateAsync();

    const proxyTimeZoneOffset: integer | null = await ( async() => {
      if( !premiumUser || proxyBroken || !dateChange.get() ) return null;

      const countries = Array.from(
        premiumUser
          ? proxyServers.premiumCountries()
          : proxyServers.freeCountries()
      );

      const proxyCountry: string | null = await ( async( country ) => {
        if( mode === 'direct' ) country = null; // NOTE
        if( !domain ) return country;

        // Filters -> domain intersection
        const filter: SiteFilter | undefined = findMatchingFilterForDomain(
          filters, domain
        );
        if( filter ) {
          if( !filter.proxyMode ) return null; // Direct filter

          const { country } = filter;
          const defaultCountry = await getDefaultCountry();
          return countries.includes( country ) ? country : defaultCountry; // Proxy filter
        }

        // No filter matched
        return country;
      })( country );

      if( !proxyCountry ) return null;

      return timezones.get( proxyCountry ) ?? null;
    })();


    return {
      'original': -new Date().getTimezoneOffset(),
      'proxy': proxyTimeZoneOffset
    };
  }
});
