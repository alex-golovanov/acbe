/* global LitUpdatedChanges, PopupBanner, SiteFilter, StoreState, SwitchesView, SwitchesViewComplexOn, SwitchesViewComplexOff*/
import activeBanner from '../../objects/activeBanner';
import Browser from 'crossbrowser-webextension';
import findMatchingFilterForDomain from 'tools/findMatchingFilterForDomain';
import getUserLanguage from 'tools/getUserLanguage';
import highLevelPac from 'highLevelPac';
import internationalize from 'tools/internationalize';
import jitsu from 'jitsu';
import punycode from 'punycode'; // eslint-disable-line n/no-deprecated-api
import sendMessage from 'tools/sendMessage';
import storage from 'storage';
import store from 'store';
import render from './homeTemplate';
import { LitElement, PropertyValues } from 'lit';
import { connect } from 'pwa-helpers/connect-mixin';
import domainsHelper from 'general/domains';
import { Experiment408 } from 'experiments';

import './home/IsItWorking';
import './home/promo';
import './home/stars';
import './home/switches';
import { getDefaultCountry } from 'tools/getDefaultCountry';

const translations: { [key: string]: string } = Object.fromEntries(
  Object.entries({
    'homePageStarsShown': 'home_page_stars_shown', // language === 'ru' ? 'Отлично!' : 'Awesome!';
    'homePageThanks': 'home_page_thanks', // language === 'ru' ? 'Спасибо за обратную связь!' : 'Thank you for your feedback!';
  }).map( ( [ key, value ] ) => [ key, internationalize( value ) ] ),
);

let reanimatorIsActivePromise = ( async() => {
  const storageValue = await storage.get( 'reanimator: in progress' );
  if( storageValue === true ) return false;

  const { domain, userPac } = await store.getStateAsync();
  if( !domain ) return false;

  let filters = userPac.filters;
  filters = filters.filter( ({ disabled }) => !disabled ); // No disabled filters

  let filter: SiteFilter | void = findMatchingFilterForDomain( filters, domain );

  if( !filter ) return userPac.mode === 'proxy';

  return filter.proxyMode;
})();

const language = getUserLanguage();

const storeExtensionUrl = ( () => {
  if( typeof browser !== 'undefined' ) {
    // Firefox
    return language === 'ru'
      ? 'https://addons.mozilla.org/ru/firefox/addon/browsec/'
      : 'https://addons.mozilla.org/en-US/firefox/addon/browsec/';
  }

  if( /Edg\//.test( navigator.userAgent ) ) {
    // Edge
    return 'https://microsoftedge.microsoft.com/addons/detail/browsec-vpn-%D0%B1%D0%B5%D1%81%D0%BF%D0%BB%D0%B0%D1%82%D0%BD%D1%8B%D0%B9-/fjnehcbecaggobjholekjijaaekbnlgj';
  }

  if( /OPR\//.test( navigator.userAgent ) ) {
    // Opera
    return language === 'ru'
      ? 'https://addons.opera.com/ru/extensions/details/browsec/'
      : 'https://addons.opera.com/en/extensions/details/browsec/';
  }

  // Chrome
  return 'https://chromewebstore.google.com/detail/browsec-vpn-free-vpn-for/omghfjlpggmjjaagoclmmobgdodcjboh/reviews';
})();

// @ts-ignore
class IndexHome extends connect( store )( LitElement ) {
  activeBanner: PopupBanner | null;
  countries: string[]; // @ts-ignore
  country: string | null;
  defaultCountry: string | null;
  language: string;
  proxyEnabled: boolean;
  switchesView: SwitchesView;

  render() {
    return render.call( this );
  }

  static get properties() {
    return {
      'activeBanner': {
        'type': Object,
      },
      'countries': {
        'type': Array,
      },
      'country': {
        'type': String,
      },
      'countryName': {
        'type': String,
      },
      'proxyEnabled': {
        'type': Boolean,
      },
      'switchesView': {
        // Show double controls for ON/OFF
        'type': Object,
      },
    };
  }

  // Lifecycle
  constructor() {
    super();

    this.activeBanner = activeBanner.get();
    this.switchesView = {
      'type': 'simple',
      'rating': undefined,
    };
    this.countries = [];
    this.defaultCountry = null;

    this.proxyEnabled = false;

    this.activeBannerListener = this.activeBannerListener.bind( this );

    // @ts-ignore
    this.language = window.language as string;
  }

  /** @method */
  async connectedCallback() {
    super.connectedCallback();

    activeBanner.addListener( this.activeBannerListener );
  }

  /** @method */
  disconnectedCallback() {
    activeBanner.removeListener( this.activeBannerListener );
  }

  /** @method */
  firstUpdated( changedProperties: PropertyValues<any> ) {
    super.firstUpdated( changedProperties );

    const shadowRoot = this.shadowRoot as ShadowRoot;

    let promo = shadowRoot.querySelector( 'index-home-promo' ) as
      | ( HTMLElement & { visible: boolean })
      | null;
    if( !promo ) {
      throw new Error( 'index-home: index-home-promo element does not exist' );
    }

    this.classList.toggle( 'proxyEnabled', this.proxyEnabled );
    this.classList.toggle( 'withPromo', Boolean( this.activeBanner ) );

    ( async() => {
      const reanimatorIsActive: boolean = await reanimatorIsActivePromise;
      if( !reanimatorIsActive ) return;

      this.defaultCountry = await getDefaultCountry();

      // Make no double execution
      reanimatorIsActivePromise = Promise.resolve( false );

      await new Promise( ( resolve ) => {
        setTimeout( resolve, 300 );
      });

      const activeElement = shadowRoot.querySelector('.Active_Top') as HTMLElement | null;
      if( !activeElement ) return;

      const oldView = activeElement.querySelector('.Active_Top_Static') as HTMLElement | null;
      if( !oldView ) return;

      const animation = oldView.animate( [ { 'opacity': 1 }, { 'opacity': 0 } ], {
        'duration': 300,
        'easing': 'linear',
      });
      await new Promise( ( resolve ) => {
        animation.onfinish = resolve;
      });

      oldView.style.cssText = 'display:none;';

      const isItWorkingElement = document.createElement( 'is-it-working' );

      const variant = await new Promise<'yes' | 'no'>( async( resolve ) => {
        // @ts-ignore
        isItWorkingElement.addEventListener(
          'choose',
          ({ detail }: { detail: 'yes' | 'no' }) => {
            resolve( detail );
          },
        );
        isItWorkingElement.style.cssText = 'opacity:0';

        activeElement.append( isItWorkingElement );

        jitsu.track( 'feedback_yesno' );

        const animation = isItWorkingElement.animate(
          [ { 'opacity': 0 }, { 'opacity': 1 } ],
          {
            'duration': 300,
            'easing': 'linear',
          },
        );
        await new Promise( ( resolve ) => {
          animation.onfinish = resolve;
        });

        isItWorkingElement.style.cssText = '';
      });

      if( variant === 'no' ) {
        await sendMessage({ 'type': 'reanimator: activate' });

        store.dispatch({ 'type': 'Page: set', 'page': 'index:reanimator' });
      }
      else if( variant === 'yes' ) {
        const starsShown: boolean =
          ( await storage.get( 'reanimator stars: shown' ) ) || false;

        {
          const animation = isItWorkingElement.animate(
            [ { 'opacity': 1 }, { 'opacity': 0 } ],
            {
              'duration': 300,
              'easing': 'linear',
            },
          );
          await new Promise( ( resolve ) => {
            animation.onfinish = resolve;
          });
        }

        isItWorkingElement.style.cssText = 'opacity:0;';
        isItWorkingElement.remove();

        if( !starsShown ) {
          storage.set( 'reanimator stars: shown', true );
          const starsElement = document.createElement( 'index-home-stars' );

          const starsRating: integer = await new Promise( async( resolve ) => {
            // @ts-ignore
            starsElement.addEventListener(
              'choose',
              ({ detail }: { detail: number }) => {
                resolve( detail );
              },
            );

            starsElement.style.cssText = 'opacity:0';

            activeElement.append( starsElement );

            {
              const animation = starsElement.animate(
                [ { 'opacity': 0 }, { 'opacity': 1 } ],
                {
                  'duration': 300,
                  'easing': 'linear',
                },
              );
              await new Promise( ( resolve ) => {
                animation.onfinish = resolve;
              });
            }

            starsElement.style.cssText = '';
          });

          jitsu.track( 'feedback_rating', { 'rating': String( starsRating ) });

          if( starsRating === 5 ) {
            const expService = new Experiment408();
            const variant = await expService.getVariantOrEngage();
            const url = variant === 1 ? Experiment408.trustpilotUrl : storeExtensionUrl;

            await Browser.tabs.create({ url, active: true });

            await new Promise( ( resolve ) => {
              setTimeout( resolve, 50 );
            });
            self?.close?.();
          } else {
            // Rating below 5
            {
              const animation = starsElement.animate(
                [ { 'opacity': 1 }, { 'opacity': 0 } ],
                {
                  'duration': 200,
                  'easing': 'linear',
                },
              );
              await new Promise( ( resolve ) => {
                animation.onfinish = resolve;
              });
            }
            starsElement.remove();
          }
        }

        // Fade in thank you
        const thankYou = document.createElement( 'div' );
        thankYou.textContent = ( () => {
          if( starsShown ) {
            return translations.homePageStarsShown;
          }

          return translations.homePageThanks;
        })();
        thankYou.style.cssText =
          'text-align:center;font-size:18px;font-weight: 600;opacity:0;';
        activeElement.append( thankYou );

        {
          const animation = thankYou.animate( [ { 'opacity': 0 }, { 'opacity': 1 } ], {
            'duration': 300,
            'easing': 'linear',
          });
          await new Promise( ( resolve ) => {
            animation.onfinish = resolve;
          });
        }
        thankYou.style.cssText =
          'text-align:center;font-size:18px;font-weight: 600;';

        // Wait a second to show message
        await new Promise( ( resolve ) => {
          setTimeout( resolve, 1000 );
        });

        // Fade out thank you
        {
          const animation = thankYou.animate( [ { 'opacity': 1 }, { 'opacity': 0 } ], {
            'duration': 300,
            'easing': 'linear',
          });
          await new Promise( ( resolve ) => {
            animation.onfinish = resolve;
          });
        }
        thankYou.remove();

        // Fade in old view
        oldView.style.cssText = 'opacity:0';
        const animation = oldView.animate( [ { 'opacity': 0 }, { 'opacity': 1 } ], {
          'duration': 300,
          'easing': 'linear',
        });
        await new Promise( ( resolve ) => {
          animation.onfinish = resolve;
        });

        oldView.style.cssText = '';
      }
    })();
  }

  /** @method */
  // @ts-ignore
  updated( changes: LitUpdatedChanges<IndexHome> ) {
    if( changes.has( 'activeBanner' ) ) {
      this.classList.toggle( 'withPromo', Boolean( this.activeBanner ) );
    }
  }

  /** @method */
  stateChanged({
    domain,
    proxyServers,
    'userPac': pac,
    ping,
    user,
  }: StoreState ): void {
    const countries: string[] = Array.from(
      user.premium
        ? proxyServers.premiumCountries()
        : proxyServers.freeCountries(),
    );

    this.countries = countries;
    this.country = pac.country;
    this.proxyEnabled = pac.mode === 'proxy';

    const { 'country': pacCountry, filters } = pac;
    const { 'premium': premiumUser } = user;

    const rating: integer | undefined = ( () => {
      if( !ping.length || !pacCountry ) return;

      return ping.find(
        ({ country, premium }) =>
          country === pacCountry && premium === premiumUser,
      )?.mark;
    })();

    if( !domain ) {
      this.switchesView = { 'type': 'simple', rating };
      return;
    }

    let filter: SiteFilter | undefined = findMatchingFilterForDomain(
      filters,
      domain,
    );

    let dependentDomain = null;
    if( !filter ) {
      filter = domainsHelper.getRelevantSmartSettingWithDomainDependency( filters, domain );
      dependentDomain = filter ? filter.value : null;
    }

    if( !filter ) {
      this.switchesView = { 'type': 'simple', rating };
      return;
    }

    const { country, proxyMode } = filter;
    const filterDomain =
      filter.value instanceof RegExp
        ? filter.value.toString()
        : filter.value;
    const view /*: string*/ = punycode.toUnicode( domain );

    // Direct filter
    if( !proxyMode ) {
      this.switchesView = { 'domain': filterDomain, 'type': 'complex off', view };
      return;
    }

    // Proxy filter
    this.switchesView = {
      'country': countries.includes( country ) ? country : this.defaultCountry,
      'domain': filterDomain,
      'type': 'complex on',
      view,
      dependentDomain,
    };
  }

  // Properties
  get countryName() /*: string*/ {
    if( !this.country ) return '';

    return internationalize( 'country_' + this.country );
  }

  // Methods
  /** @method */
  activeBannerListener( activeBanner: PopupBanner ) {
    this.activeBanner = activeBanner || null;
  }

  /** @method */
  countryChange() /*: void*/ {
    jitsu.track( 'main_country' );
    store.dispatch({ 'type': 'Page: set', 'page': 'index:locations' });
  }

  /** @method */
  domainProxySwitch(): void {
    let { domain } = this.switchesView as
      | SwitchesViewComplexOff
      | SwitchesViewComplexOn;
    highLevelPac.siteFilters.toggle( domain );
  }

  /** @method */
  domainCountryChange() /*: void*/ {
    let { domain } = this.switchesView as
      | SwitchesViewComplexOff
      | SwitchesViewComplexOn;
    store.dispatch({
      'type': 'Page: set',
      'page': 'index:locations:' + domain,
    });
  }

  /** @method */
  async enableProxy(): Promise<void> {
    await highLevelPac.enable();
  }

  /** @method */
  openLocations() /*: void*/ {
    jitsu.track( 'main_country' );
    store.dispatch({ 'type': 'Page: set', 'page': 'index:locations' });
  }

  /** @method */
  async proxySwitch() /*: void*/ {
    const reanimatorActive = await storage.get( 'reanimator: in progress' );
    if( reanimatorActive ) return;

    if( !this.proxyEnabled ) highLevelPac.enable();
    else {
      highLevelPac.disable();
      jitsu.track( 'vpnOff' );
    }
  }
}
customElements.define( 'index-home', IndexHome );

export default IndexHome;
