/* global LowLevelPac, MigrationStoreAccount, PingRating, Price, Promotion, ProxyServerCountryData, StoreAccount, StoreGuestAccount, StoreState, UserPac, DynamicConfig */
import Browser from 'crossbrowser-webextension';
import config from 'config';
import defaultPrices from 'bg/defaultPrices';
import isObject from 'tools/isObject';
import makeProxyServersMap from 'tools/makeProxyServersMap';
import { pacHostsToCountryPrefixPorts } from 'tools/index';
import getServers from 'bg/serversObject/get';


/** @function */
const getDefaultPac: () => UserPac = () => ({
  'mode': 'direct',
  'country': null,
  'broken': false,
  'filters': []
});

/** @function */
const getDefaultUser = () => {
  const defaultUser =
    { 'type': 'guest', 'premium': false, 'timestamp': {} } as StoreGuestAccount;

  return defaultUser;
};


/** @function */
export default async( argStorageValue?: any ): Promise<StoreState> => {
  let state = {
    // Page: index:home, index:changeLocation, login
    'page': 'index:home'
  };

  const storageValue =
    argStorageValue || await Browser.storage.local.get( [
      'account',
      'browsec.com available',
      'cacheRemoval',
      'daysAfterInstall',
      'domain',
      'dynamicConfig',
      'favorites',
      'lowLevelPac',
      'ping',
      'pingInProcess',
      'recommendedCountries',
      'prices',
      'priceTrial',
      'promotions',
      'promotionsBlock',
      'proxyIsBroken',
      'timezoneChange',
      'userPac',
      'viewed personal banners',
      'webrtc',
      'webrtcBlock',
      'warnings'
    ] );

  const serversObject = await getServers();
  const serversObjectKeys = Object.keys( serversObject.countries );

  let {
    account,
    'browsec.com available': browsecComAvailable,
    cacheRemoval,
    daysAfterInstall,
    domain,
    dynamicConfig,
    favorites,
    lowLevelPac,
    ping,
    pingInProcess,
    recommendedCountries,
    prices,
    priceTrial,
    promotions,
    promotionsBlock,
    proxyIsBroken,
    timezoneChange,
    userPac,
    'viewed personal banners': viewedPersonalBanners,
    webrtc,
    webrtcBlock,
    warnings = []
  } = storageValue;

  return Object.assign( state, {
    'browsecComAvailable': ( (): 'yes' | 'no' | 'unknown' | 'checking' => {
      if( typeof browsecComAvailable !== 'string' ) return 'unknown';
      if( ![ 'yes', 'no', 'unknown', 'checking' ].includes( browsecComAvailable ) ) {
        return 'unknown';
      }

      return browsecComAvailable as ( 'yes' | 'no' | 'unknown' | 'checking' );
    })(),

    // Remove cache to resolve onAuthRequired problems
    'cacheRemoval': ( (): boolean => {
      return cacheRemoval ?? false;
    })(),

    // Days after instllation
    'daysAfterInstall': ( (): integer => {
      if( typeof daysAfterInstall !== 'number' ) return 0;

      return Math.floor(
        ( Date.now() - daysAfterInstall ) / ( 24 * 3600 * 1000 )
      );
    })(),

    // Current URL domain
    'domain': ( () => {
      if( location.href.includes( 'background' ) ) return null;

      return domain || null;
    })(),

    'dynamicConfig': ( (): DynamicConfig => {
      const defaultDynamicConfig: DynamicConfig = {
        'browsecCountry': 'fi',
      };

      if( !isObject( dynamicConfig ) ) return defaultDynamicConfig;

      return dynamicConfig;
    })(),

    // Favorite countries (only for premium user)
    'favorites': ( (): string[] => {
      const condition =
        Array.isArray( favorites )
        && favorites.every( item => typeof item === 'string' );

      return condition ? favorites : [];
    })(),

    // Low level PAC
    'lowLevelPac': ( (): LowLevelPac => {
      return lowLevelPac || {
        'browsecCountry': null,
        'countries': {}, // { [ country: string ]: any },
        'globalReturn': null,
        'ignoredDomains': [],
        'premiumCountries': {}, // { [ country: string ]: any },
        'siteFilters': []
      };
    })(),

    // Ping to our servers
    'ping': ( (): PingRating[] => {
      if( !Array.isArray( ping ) ) return [];

      let codition = ping.every( item => (
        isObject( item )
        && typeof item.country === 'string'
        && typeof item.premium === 'boolean'
        && typeof item.delay === 'number'
        && typeof item.mark === 'number'
      ) );

      return codition ? ping : [];
    })(),

    'pingInProcess': ( (): boolean => {
      return typeof pingInProcess === 'boolean' ? pingInProcess : false;
    })(),

    'recommendedCountries': ((): { free: string[], premium: string[] } => {
      if( !recommendedCountries?.free || !recommendedCountries?.premium ) {
        return { 'free': [], 'premium': [] };
      }

      return recommendedCountries;
    })(),

    // Internal tarrifs
    'prices': ( (): Price[] => {
      if( !Array.isArray( prices ) || !prices.length ) return defaultPrices;

      const condition = prices.every( item => (
        isObject( item )
        && typeof item.currency === 'string'
        && typeof item.value === 'number'
        && typeof item.duration === 'number'
      ) );

      return condition ? prices : defaultPrices;
    })(),

    // Trial days if present
    'priceTrial': ( (): integer | undefined => (
      typeof priceTrial === 'number' ? priceTrial : undefined
    ) )(),

    // Raw promotions
    'promotions': ( (): Promotion[] => {
      if( !Array.isArray( promotions ) ) return [];

      return promotions.filter( item => (
        isObject( item )
        && (
          !item.banner
          || typeof item?.banner?.link === 'string'
          && typeof item?.banner?.structure === 'object'
        )
        && typeof item.id === 'string'
        && typeof item.from === 'number'
        && [ 'common', 'personal' ].includes( item.kind )
        && ( !item.page || typeof item.page === 'string' )
        && typeof item.till === 'number'
      ) );
    })(),

    // Block promotions for free users
    'promotionsBlock': ( (): boolean => (
      typeof promotionsBlock === 'boolean' ? promotionsBlock : false
    ) )(),

    // Is proxy broken?
    'proxyIsBroken': ( () => (
      typeof proxyIsBroken === 'boolean' ? proxyIsBroken : false
    ) )(),

    // List of proxy servers
    'proxyServers': ( () => {
      const object: Map<string, ProxyServerCountryData> = new Map();

      for( const country of serversObjectKeys ) {
        const item = serversObject.countries[ country ];

        const countryData: ProxyServerCountryData = {};
        if( item.fast_servers ) {
          countryData.fast = pacHostsToCountryPrefixPorts( item.fast_servers );
        }
        if( item.premium_servers ) {
          countryData.premium = pacHostsToCountryPrefixPorts( item.premium_servers );
        }
        if( item.servers ) {
          countryData.free = pacHostsToCountryPrefixPorts( item.servers );
        }

        object.set( country, countryData );
      }

      return makeProxyServersMap( object );
    })(),

    'timezones': ( () => {
      const object: Map<string, integer> = new Map();

      for( const country of serversObjectKeys ) {
        const offset = serversObject.countries[ country ].timezoneOffset;
        if( typeof offset === 'number' ) object.set( country, offset );
      }

      return object;
    })(),

    'timezoneChange': ( (): boolean => (
      typeof timezoneChange === 'boolean' ? timezoneChange : false
    ) )(),

    // Information about owner
    'user': ( (): StoreAccount => {
      const storageValue = account;
      if( !storageValue ) return getDefaultUser();

      if( storageValue.type ) return storageValue;

      const oldAccount = storageValue as MigrationStoreAccount;
      if( !( 'email' in oldAccount ) ) return getDefaultUser();

      return {
        'email': oldAccount.email,
        'loginData': {
          'id': oldAccount.id,
          'credentials': oldAccount.credentials,
          'subscription': oldAccount.subscription
        },
        'premium': oldAccount.premium,
        'timestamp': {
          'validUntil': oldAccount.validUntil,
          'version': oldAccount.version
        },
        'type': 'logined'
      };
    })(),

    // Pac script state
    'userPac': ( (): UserPac => {
      if( !isObject( userPac ) ) return getDefaultPac();

      const condition =
        [ 'direct', 'proxy' ].includes( userPac.mode )
        && ( userPac.country === null || typeof userPac.country === 'string' )
        && Array.isArray( userPac.filters );
      if( !condition ) return getDefaultPac();

      if( userPac.filters.length ) {
        // Migration
        if( userPac.filters.some( ( filter: any ) => filter.domain ) ) {
          userPac.filters = userPac.filters.map(
            ({ country, disabled, domain, proxyMode }: {
              'country': string,
              'disabled': boolean,
              'domain': string,
              'proxyMode': boolean
            }) => ({
              country,
              disabled,
              'format': 'domain',
              'value': domain,
              proxyMode
            })
          );
        }
        else {
          for( const filter of userPac.filters ) {
            if( filter.format !== 'regex' ) continue;
            filter.value = new RegExp( filter.value.slice( 1, -1 ) );
          }
        }
      }

      return userPac;
    })(),

    // Personal banners that user viewed in popup
    'viewedPersonalBanners': ( (): string[] => {
      if( !Array.isArray( viewedPersonalBanners ) ) return [];

      let condition =
        viewedPersonalBanners.length
        && viewedPersonalBanners.every( item => typeof item === 'string' );

      return condition ? viewedPersonalBanners : [];
    })(),

    // Block WebRTC (enable protection and activate it if proxy enabled)
    'webrtcBlock': ( (): boolean | null => {
      if( typeof webrtcBlock === 'boolean' ) return webrtcBlock;
      return typeof webrtc === 'boolean' ? webrtc : null;
    })(),

    warnings,
  });
};
