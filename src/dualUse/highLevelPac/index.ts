/* global SiteFilter, UserPac */
import config from 'config';
import filtersSorting from 'tools/filtersSorting';
import findMatchingFilterForDomain from 'tools/findMatchingFilterForDomain';
import store from 'store';
import log from 'log';
import { getDefaultCountry } from 'tools/getDefaultCountry';

const { _ } = self;


/** Enable proxy with desired country
@method
@param country - 2 letter code */
const setCountry = async( country: string ): Promise<UserPac> => {
  log( '[highLevelPac#setCountry]', country );

  const { userPac } = await store.getStateAsync();

  const pac = Object.assign(
    _.cloneDeep( userPac ),
    { 'mode': 'proxy', country }
  );

  store.dispatch({
    'type': 'User PAC: set',
    'data': pac
  });

  return pac;
};

/** Enable proxy
@method */
const enable = async(): Promise<UserPac> => {
  const { userPac } = await store.getStateAsync();
  const defaultCountry = await getDefaultCountry();

  return setCountry( userPac.country || defaultCountry );
};

/** Disable proxy
@method */
const disable = async(): Promise<UserPac> => {
  log( '[highLevelPac#disable]' );

  const { userPac } = await store.getStateAsync();

  const pac = Object.assign(
    _.cloneDeep( userPac ),
    { 'mode': 'direct' }
  );

  store.dispatch({
    'type': 'User PAC: set',
    'data': pac
  });

  return pac;
};

const siteFilters = {
  /** Add filter to filters list
  @method */
  'add': async({
    'country': argCountry,
    domain,
    type
  }: {
    'country'?: string,
    'domain': string,
    'type': 'proxy' | 'direct'
  }): Promise<UserPac> => {
    log( '[highLevelPac.siteFilters#add]', domain, type );

    const { userPac } = await store.getStateAsync();
    const defaultCountry = await getDefaultCountry();

    const country = argCountry || userPac.country || defaultCountry;
    const filters: SiteFilter[] = userPac.filters.slice();

    filters.push({
      country,
      'format': 'domain',
      'proxyMode': type === 'proxy',
      'value': domain
    });
    filters.sort( filtersSorting );

    const pac = Object.assign( _.cloneDeep( userPac ), { filters });

    store.dispatch({
      'type': 'User PAC: set',
      'data': pac
    });

    return pac;
  },

  /** Remove filter with this domain from filters list
  @method */
  'remove': async( domain: string ): Promise<UserPac> => {
    log( '[highLevelPac.siteFilters#remove]', domain );

    const { userPac } = await store.getStateAsync();

    const filters: SiteFilter[] = userPac.filters.slice();
    _.remove( filters, item => item.value === domain );

    const pac = Object.assign( _.cloneDeep( userPac ), { filters });

    store.dispatch({
      'type': 'User PAC: set',
      'data': pac
    });

    return pac;
  },

  /** Convert proxy filter to direct OR direct to proxy
  @method */
  'toggle': async( domain: string ): Promise<UserPac> => {
    const { userPac } = await store.getStateAsync();

    const filter: SiteFilter | void = userPac.filters.find(
      item => item.format !== 'regex' && item.value === domain
    );
    if( !filter ) {
      throw new Error( `Nonexistent domain ${domain} passed to highLevelPac.toggle` );
    }

    const country: string | null = !filter.proxyMode ? filter.country : null;

    return siteFilters.changeCountry({ domain, country });
  },

  /** Change country for proxy filter
  @method */
  'changeCountry': async({ country, domain }: {
    'country': string | null,
    'domain': string
  }): Promise<UserPac> => {
    log( '[highLevelPac.siteFilters#changeCountry]', domain, country );

    const { userPac } = await store.getStateAsync();

    const filters: SiteFilter[] = _.cloneDeep( userPac.filters );

    const filter: SiteFilter | void = findMatchingFilterForDomain(
      filters, domain
    );

    // Change country for existing filter
    if( filter ) {
      if( country ) filter.country = country;
      filter.proxyMode = Boolean( country );

      const pac = Object.assign( _.cloneDeep( userPac ), { filters });

      store.dispatch({
        'type': 'User PAC: set',
        'data': pac
      });

      return pac;
    }

    // Add new filter
    if( !country ) return siteFilters.add({ domain, 'type': 'proxy' });

    return siteFilters.add({ country, domain, 'type': 'proxy' });
  }
};


export default { disable, enable, setCountry, siteFilters };
