/* global LitUpdatedChanges, LocationsNameListItem, LocationsRenderServerData, SiteFilter, StoreState */
import actions from '../../tools/actions';
import CharsBuffer from 'tools/CharsBuffer';
import computeCountries from './locations/computeCountries';
import ga from 'ga';
import highLevelPac from 'highLevelPac';
import internationalize from 'tools/internationalize';
import jitsu from 'jitsu';
import keydownListener from './locations/keydownListener';
import log from 'log';
import PopupPremium from '../popups/premium';
import render from './locationsTemplate';
import sendMessage from 'tools/sendMessage';
import store from 'store';
import { connect } from 'pwa-helpers/connect-mixin';
import { LitElement } from 'lit';
import './locations/element';


const { _ } = self;
const _browser = typeof browser !== 'undefined' ? browser : chrome;


/** Get full country name by 2 letter code
@function */
const countryNameByCode = (
  code: string // 2 letter code
): string => {
  const countryName/*: string*/ = internationalize( 'country_' + code );
  if( countryName ) return countryName;

  const locale = _browser.i18n.getUILanguage();
  const version: string =
    _browser.runtime.getManifest().version;

  const message =
    'failed to look up country name for: ' + code +
    ' with locale: ' + locale + ' at popup.js';
  log.warn( message );
  ga.partial({
    'category': 'error',
    'action': version,
    'label': message,
    'value': '0',
    'noninteraction': false
  });

  return code.toUpperCase() || 'N/A';
};


// @ts-ignore
class IndexLocations extends connect( store )( LitElement ) { // @ts-ignore
  charsBuffer: CharsBuffer; // @ts-ignore
  countries: LocationsRenderServerData[];
  country: string | null;
  domain: string;
  highlightedCountry: { 'premium': boolean, 'code': string } | null;
  keydownListener: ( event: KeyboardEvent ) => any; // @ts-ignore
  namesList: LocationsNameListItem[]; // @ts-ignore
  premiumUser: boolean;
  proxyCountry: string | null;
  proxyList: SiteFilter[]; // @ts-ignore
  scrollElement: HTMLElement;
  pingInProcess: boolean;
  recommendedCountries: string[];

  render() {
    return render.call( this );
  }
  static get properties() {
    return {
      'countries': { 'type': Array },

      /** In case of global locations -> pac.country,
      otherwise selected country in case of proxy filter */
      'country': {
        'type': String
      },

      /** Used for setup of country for filter */
      'domain': {
        'type': String
      },
      'highlightedCountry': {
        'type': Object
      },
      'premiumUser': {
        'type': Boolean
      },
      'proxyCountry': {
        'type': String
      },
      'proxyList': { 'type': Array }
    };
  }

  // Lifecycle
  constructor() {
    super();

    // Method bindings
    this.elementHighlight = this.elementHighlight.bind( this );
    this.keydownListener = keydownListener.bind( this );

    this.country = null;
    this.domain = '';
    this.highlightedCountry = null;
    this.proxyCountry = '';
    this.proxyList = [];
    this.pingInProcess = false;
    this.recommendedCountries = [];
  }

  /** @method */
  async connectedCallback() {
    super.connectedCallback();

    const shadowRoot = this.shadowRoot as ShadowRoot;

    this.charsBuffer = new CharsBuffer();
    document.addEventListener( 'keydown', this.keydownListener );

    await this.forceRenderAndGenerateNamesList();

    const collection = shadowRoot.children;
    const scrollElement =
      collection[ collection.length - 1 ] as HTMLElement | undefined;
    if( !scrollElement ) {
      throw new Error( 'index-locations: scrollElement does not exist' );
    }
    this.scrollElement = scrollElement;

    this.charsBuffer.addListener( ( word: string ) => {
      const match =
        this.namesList.find( ({ name }) => name.startsWith( word ) );
      if( !match ) return;

      const { code, element, premium } = match;

      this.highlightedCountry = { code, premium };

      // Scroll to this element
      this.scrollElement.scrollTop = element.offsetTop - 2;
    });

    const height: number = ( () => {
      const element =
        shadowRoot.querySelector( 'div.Head' ) as ( HTMLElement | null );
      if( !element ) {
        throw new Error( 'index-locations: div.Head does not exist' );
      }

      return element.offsetHeight;
    })();

    {
      const element =
        shadowRoot.querySelector( 'div.Sections' ) as ( HTMLElement | null );
      if( !element ) {
        throw new Error( 'index-locations: div.Sections does not exist' );
      }
      element.style.cssText = `top:${height}px;`;
    }


    if( !this.domain ) {
      sendMessage({
        'type': 'counters.increase',
        'property': 'popup: location page shows'
      });
    }
  }

  /** @method */
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener( 'keydown', this.keydownListener );
  }

  /** @method */
  // @ts-ignore
  updated( changes: LitUpdatedChanges<IndexLocations> ) {
    const keys = Array.from( changes.keys() );

    if( changes.has( 'countries' ) ) this.forceRenderAndGenerateNamesList();

    if( !keys.some( key => [ 'domain', 'proxyCountry', 'proxyList' ].includes( key ) ) ) {
      return;
    }

    const { domain, proxyCountry, proxyList } = this;

    // Global settings
    if( !domain ) {
      this.country = proxyCountry;
      return;
    }

    // Domain only
    this.country =
      proxyList.find( item => item.value === domain )?.country || '';
  }

  /** @method */
  stateChanged( state: StoreState ): void {
    // @ts-ignore
    const language = window.language as string;

    const { 'userPac': pac, user, pingInProcess, recommendedCountries } = state;

    this.countries = computeCountries( state, countryNameByCode, language );
    this.premiumUser = user.premium;
    this.proxyCountry = pac.mode === 'proxy' ? pac.country : null;
    this.pingInProcess = pingInProcess;
    this.recommendedCountries = user.premium ? recommendedCountries.premium : recommendedCountries.free;
    this.proxyList = pac.filters.filter(
      ({ disabled, proxyMode }) => !disabled && proxyMode
    );
  }

  // Methods
  /** @method */
  back() {
    store.dispatch({ 'type': 'Page: set', 'page': 'index:home' });

    if( !this.domain ) jitsu.track( 'countries_back' );
  }

  /** @method */
  async countryClick(
    { 'detail': { mode, country } }:
    { 'detail': {
      'country': string,
      'mode': 'change' | 'current' | 'premium'
    } }
  ) {
    // @ts-ignore
    if( window.animationInProgress ) return;

    if( !this.domain ) {
      const { userPac } = await store.getStateAsync();

      const extra: { [ key: string ]: string } =
        { 'change_country_code': country };
      if( userPac.mode === 'proxy' ) {
        extra.change_countryfrom_code = userPac.country as string;
      }

      jitsu.track( 'countries_select', extra );
    }

    if( mode === 'change' ) {
      if( this.domain ) {
        await highLevelPac.siteFilters.changeCountry({ 'domain': this.domain, country });
      }
      else {
        await highLevelPac.setCountry( country );

        ga.partial({
          'category': 'extension',
          'action': 'change_country',
          'label': country
        });
        jitsu.track(
          'change_country',
          { 'new_country': country }
        );
      }

      await new Promise( resolve => { setTimeout( resolve, 500 ); });
      store.dispatch({ 'type': 'Page: set', 'page': 'index:home' });
    }
    else if( mode === 'premium' ) {
      // @ts-ignore
      window.animationInProgress = true;

      const popupPremium =
        document.createElement( 'popup-premium' ) as PopupPremium;
      popupPremium.country = country;
      popupPremium.initiator = 'premium locations';
      popupPremium.style.cssText = 'top:-100%;';

      document.body.append( popupPremium );

      ga.partial({ 'category': 'premium', 'action': 'show' });

      const animation = popupPremium.animate(
        [
          { 'top': '-100%' },
          { 'top': '0' }
        ],
        { 'duration': 800, 'easing': 'linear' }
      );
      await new Promise( resolve => { animation.onfinish = resolve; });

      popupPremium.style.cssText = '';

      // @ts-ignore
      window.animationInProgress = false;
    }
  }

  /** @method */
  elementHighlight({ premium, code }: LocationsRenderServerData ) {
    return ( event: MouseEvent ): void => {
      const mouseReallyMoved = Boolean( event.movementX || event.movementY );
      if( !mouseReallyMoved ) return;

      const data/*: Object*/ = { premium, code };

      if( _.isEqual( this.highlightedCountry, data ) ) return;

      this.highlightedCountry = data;
    };
  }

  /** @method */
  favorite(
    { 'detail': { favorited, country } }:
    { 'detail': { 'favorited': boolean, 'country': string } }
  ): void {
    if( favorited ) actions.favorites.add( country );
    else actions.favorites.remove( country );
  }

  /** @method */
  async forceRenderAndGenerateNamesList()/*: Promise<void>*/ {
    const shadowRoot = this.shadowRoot as ShadowRoot;

    // Force render
    await this.requestUpdate();

    // Merge countries & DOM nodes
    this.namesList = ( () => {
      const listData = this.countries.map(
        ({ code, name, premium }) => ({
          code, 'name': name.toLowerCase(), premium
        })
      );

      const collection =
        shadowRoot.querySelector( 'div.Sections' )?.children as HTMLCollection;
      const elements: HTMLElement[] = [];
      for( const element of collection ) {
        if( element.tagName.toLowerCase() === 'index-locations-element' ) {
          elements.push( element as HTMLElement );
        }
      }

      return listData.map( ( item, index ) => Object.assign(
        { 'element': elements[ index ] }, item
      ) );
    })();
  }

  /** @method */
  async openHelp()/*: Promise<void>*/ {
    jitsu.track( 'countries_info' );

    const parent =
      document.querySelector( 'div.MainContainer' ) as ( HTMLElement | null );
    if( !parent ) return;

    const element/*: HTMLElement*/ =
      document.createElement( 'popup-locations-information' );
    element.style.cssText = 'opacity:0';

    parent.append( element );

    const animation = element.animate(
      [
        { 'opacity': 0 },
        { 'opacity': 1 }
      ],
      { 'duration': 400, 'easing': 'linear' }
    );
    await new Promise( resolve => { animation.onfinish = resolve; });

    element.style.cssText = '';
  }
}
customElements.define( 'index-locations', IndexLocations );


export default IndexLocations;
