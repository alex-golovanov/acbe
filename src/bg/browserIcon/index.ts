/* global DomainDependency, Promotion, ProxyServers, SiteFilter, StoreState */
import Browser from 'crossbrowser-webextension';
import browserAction from './browserAction';
import config from 'config';
// import dependencies from 'lowLevelPac/domainDependencies';
// import findMatchingFilterForDomain from 'tools/findMatchingFilterForDomain';
// import findMatchingDependencyForDomain from 'tools/findMatchingDependencyForDomain';
import setIcon from './setIcon';
import store from 'store';
import domainsHelper from 'general/domains'

const { _ } = self;


type IconState = {
  'broken': boolean,
  'country': string | null,
  'notification': boolean
};


const manifestVersion = Browser.runtime.getManifest().manifest_version;


/** @class singleton */
const Icon = new class {
  state: IconState;

  constructor() {
    this.state = {
      'broken': false,
      'country': null,
      'notification': false
    };
  }

  // Puts browser icon
  setState(
    { broken, country, domain, filters, mode, userHasUnviewedBanners }: {
      'broken': boolean,
      'country': string | null,
      'domain': string | null,
      'filters': SiteFilter[],
      'mode': string,
      'userHasUnviewedBanners': boolean
    },
    forceUpdate: boolean = false
  ): void {
    filters = filters.filter( ({ disabled }) => !disabled ); // No disabled filters

    let proxyCountry: string | null = ( () => {
      if( broken ) return null; // Proxy broken -> like DIRECT

      if( mode === 'direct' ) country = null; // NOTE
      if( !domain ) return country;

      // Check if domain is in SmartSettings (filters), including SmartSettings dependencies
      let filter: SiteFilter | void = domainsHelper.getRelevantSmartSettingWithDomainDependency( filters, domain );
      // Filters -> direct domain intersection
      // let filter: SiteFilter | void = findMatchingFilterForDomain(
      //   filters, domain
      // );

      // Filters -> domain dependency
      // if( !filter ) {
      //   ( () => {
      //     const domainDependenciesBlock: DomainDependency | void =
      //       findMatchingDependencyForDomain( dependencies, domain );
      //     if( !domainDependenciesBlock ) return;

      //     const {
      //       'domain': domainArray, fullDomain, regex
      //     } = domainDependenciesBlock;
      //     filter = filters.find( ({ value }) => (
      //       typeof value === 'string' && (
      //         findMatchingFilterForDomain(
      //           domainArray.map( value => ({ value, 'format': 'domain' }) ),
      //           value
      //         )
      //         || findMatchingFilterForDomain(
      //           fullDomain.map( value => ({ value, 'format': 'full domain' }) ),
      //           value
      //         )
      //         || findMatchingFilterForDomain(
      //           regex.map( value => ({ value, 'format': 'regex' }) ),
      //           value
      //         )
      //       )
      //     ) );
      //   })();
      // }

      if( filter ) {
        if( !filter.proxyMode ) return null; // Direct filter

        let { country } = filter;
        return country; // Proxy filter
      }

      // No filter matched
      return country;
    })();

    if( !forceUpdate ) {
      let condition: boolean = _.isEqual( this.state, {
        broken,
        'country': proxyCountry,
        'notification': userHasUnviewedBanners
      });
      if( condition ) return; // Do nothing - no changes needed
    }

    const errorIcon: boolean =
      broken
      && ( mode === 'proxy' || filters.some( ({ proxyMode }) => proxyMode ) );

    const iconState: 'disabled' | 'disabled notification' | 'enabled' | 'enabled notification' | 'error' =
      ( () => {
        if( errorIcon ) return 'error';
        if( proxyCountry ) return userHasUnviewedBanners ? 'enabled notification' : 'enabled';
        return userHasUnviewedBanners ? 'disabled notification' : 'disabled';
      })();
    setIcon( iconState );


    if( proxyCountry ) {
      browserAction.setBadgeText({ 'text': proxyCountry.toUpperCase() });
      if( typeof browser !== 'undefined' ) {
        browser.browserAction.setBadgeTextColor({ 'color': '#fff' });
      }
    }
    else {
      browserAction.setBadgeText({ 'text': '' });
      if( typeof browser !== 'undefined' ) {
        browser.browserAction.setBadgeTextColor({ 'color': '#fff' });
      }
    }

    this.state = {
      broken, 'country': proxyCountry, 'notification': userHasUnviewedBanners
    };
  }
}();


/** @function */
const storeStateConversion = ( state: StoreState ) => {
  const {
    domain,
    promotions,
    'proxyIsBroken': broken,
    'proxyServers': servers,
    'user': { 'premium': premiumUser },
    'userPac': { country, filters, mode },
    viewedPersonalBanners,
    warnings
  } = state;


  return {
    broken,
    country,
    domain,
    filters,
    mode,
    premiumUser,
    promotions,
    servers,
    viewedPersonalBanners,
    warnings
  };
};

/** @function */
const stateChange = (
  {
    broken,
    country,
    domain,
    filters,
    mode,
    premiumUser,
    promotions,
    servers,
    viewedPersonalBanners,
    warnings
  }: {
    broken: boolean,
    country: string | null,
    domain: string | null,
    filters: SiteFilter[],
    mode: string,
    premiumUser: boolean,
    promotions: Promotion[],
    servers: ProxyServers,
    viewedPersonalBanners: string[]
    warnings: string[]
  },
  forceUpdate: boolean = false
): void => {
  const now: integer = Date.now();

  let userHasUnviewedBanners: boolean = false;

  if( warnings.length ) {
    userHasUnviewedBanners = true;
  }

  for( const { from, id, kind, till } of promotions ) {
    if( from > now || now > till || kind !== 'personal' ) continue;
    if( viewedPersonalBanners.includes( id ) ) continue;

    userHasUnviewedBanners = true;
    break;
  }

  Icon.setState(
    { broken, country, domain, filters, mode, userHasUnviewedBanners },
    forceUpdate
  );
};


// Initial icon state
browserAction.setBadgeBackgroundColor({ 'color': '#1c304e' });

( async() => {
  const state = await store.getStateAsync();

  // After getting all data from store
  stateChange( storeStateConversion( state ), true );
})();


// Store changes subscription
store.onChange(
  storeStateConversion,
  ( convertedState ) => {
    stateChange(
      convertedState,
      manifestVersion === 3
    );
  }
);
