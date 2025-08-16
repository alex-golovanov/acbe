/* global NodeListOf, SiteFilterDomain, SiteFilterFullDomain, StoreState */
import { browsecLink } from 'general/tools';
import jitsu from 'jitsu';
import pageLinks from 'pageLinks';
import punycode from 'punycode'; // eslint-disable-line n/no-deprecated-api
import sendMessage from 'tools/sendMessage';
import ShowedOffers from '../../tools/ShowedOffers';
import storage from 'storage';
import store from 'store';
import render from './menuTemplate';
import { LitElement } from 'lit';
import { connect } from 'pwa-helpers/connect-mixin';


type ContextMenuElement = HTMLElement & {
  'containsFilter'?: boolean,
  'domain'?: string | null,
  'unicodeDomain'?: string
}


// @ts-ignore
class IndexMenu extends connect( store )( LitElement ) { // @ts-ignore
  containsFilter: boolean;
  documentClick?: ( event: MouseEvent ) => any;
  domain: string | null;
  filtersPage: boolean;
  homePage: boolean;
  settingsPage: boolean;

  render() {
    return render.call( this );
  }
  static get properties() {
    return {
      'containsFilter': {
        'type': Boolean
      },
      'domain': {
        'type': String
      },
      'filtersPage': {
        'type': Boolean
      },
      'homePage': {
        'type': Boolean
      },
      'settingsPage': {
        'type': Boolean
      },
      'telegramUrl': {
        'type': String
      },
    };
  }

  // Lifecycle
  constructor() {
    super();

    this.domain = null;
    this.filtersPage = false;
    this.homePage = false;
    this.settingsPage = false;
  }

  /** @method */
  connectedCallback() {
    super.connectedCallback();

    const shadowRoot = this.shadowRoot as ShadowRoot;

    // Remove empty nodes
    for( const node of shadowRoot.childNodes ) {
      if( node.nodeType !== Node.ELEMENT_NODE ) node.remove();
    }

    // for FF and early Chrome -> links click
    const list =
      shadowRoot.querySelectorAll( 'a' ) as NodeListOf<HTMLAnchorElement>;
    for( const element of list ) {
      element.addEventListener( 'click', async() => {
        await new Promise( resolve => { setTimeout( resolve, 50 ); });
        self?.close?.();
      });
    }
  }

  /** @method */
  disconnectedCallback() {
    super.disconnectedCallback();
    if( !this.documentClick ) return;

    document.removeEventListener( 'mousedown', this.documentClick );
    delete this.documentClick;
  }

  /** @method */
  stateChanged({ domain, 'userPac': pac, page }: StoreState ): void {
    this.containsFilter = ( () => {
      if( !domain ) return false;
      let domains: string[] = pac.filters
        .filter(
          ( item ): item is SiteFilterDomain | SiteFilterFullDomain => (
            !item.disabled && item.format !== 'regex'
          )
        )
        .map( item => item.value );

      // Is domain in list of domains
      return domains.some( filterDomain => (
        filterDomain === domain || domain.endsWith( '.' + filterDomain )
      ) );
    })();

    this.domain = ( ()/*: string | null*/ => {
      if( !domain ) return null; // No domain case

      // Ignore disabled filters
      let filters = pac.filters.filter(
        ( item ): item is SiteFilterDomain | SiteFilterFullDomain => {
          let { disabled, format } = item;
          return !disabled && format !== 'regex';
        }
      );

      // Searching for filters with same domain
      if( filters.some( ({ value }) => value === domain ) ) return domain;

      // Searching for filters where original domain is subdomain
      let filter/*: SiteFilterDomain | SiteFilterFullDomain | void*/ =
        filters.find( ({ format, value }) => (
          format === 'domain' && domain.endsWith( '.' + value )
        ) );
      if( filter ) return filter.value;

      // Otherwise, return cutted original domain (+1 to domain zone)
      let domainZone: string | undefined = // @ts-ignore
        self.domainZoneList.find( zone => domain.endsWith( '.' + zone ) );
      if( !domainZone ) return domain;

      let endPart/*: string*/ = domain.slice( 0, -( domainZone.length + 1 ) )
        .split( '.' )
        .pop();
      return endPart + '.' + domainZone;
    })();

    this.filtersPage = ( () => {
      const parts = page.split( ':' );
      return parts[ 0 ] === 'index' && parts[ 1 ] === 'filters';
    })();

    this.homePage = ( () => {
      const parts = page.split( ':' );
      return parts[ 0 ] === 'index' && parts[ 1 ] === 'home';
    })();

    this.settingsPage = ( () => {
      const parts = page.split( ':' );
      return parts[ 0 ] === 'index' && parts[ 1 ] === 'settings';
    })();
  }

  // Properties
  get contactUsUrl() {
    return browsecLink({
      'storeState': store.getStateSync(),
      'url': pageLinks.contactUs,
    });
  }
  get telegramUrl() { // @ts-ignore
    return window.language === 'ru'
      ? 'https://t.me/+iI40KV59jUFjNGE5'
      : 'https://t.me/+c_VcDz5cb5I4OTgx';
  }

  // Methods
  /** @method */
  contactUsClick() {
    jitsu.track( 'mainmenu_mail' );
  }

  /** @method */
  async goHome() {
    if( this.homePage ) return;

    const reanimatorActive = await storage.get( 'reanimator: in progress' );
    if( reanimatorActive ) return;

    store.dispatch({ 'type': 'Page: set', 'page': 'index:home' });
  }

  /** @method */
  async goSettings() {
    if( this.settingsPage ) return;

    const reanimatorActive = await storage.get( 'reanimator: in progress' );
    if( reanimatorActive ) return;

    jitsu.track( 'main_settings' );

    store.dispatch({ 'type': 'Page: set', 'page': 'index:settings' });
  }

  /** @method */
  async openSettings( event: Event ) {
    event.preventDefault();

    if( this.documentClick ) return;

    const reanimatorActive = await storage.get( 'reanimator: in progress' );
    if( reanimatorActive ) return;

    sendMessage({
      'type': 'counters.increase',
      'property': 'popup: menu: smart settings click'
    });

    jitsu.track( 'mainmenu_smartsetting' );

    ( async() => {
      if( await ShowedOffers.includes( 'smart settings' ) ) return;

      ShowedOffers.push( 'smart settings' );

      const { userPac } = await store.getStateAsync();

      if( userPac.filters.length ) return;

      jitsu.track( 'smartSettings_intro' );

      document.body.append( document.createElement( 'popup-help' ) );
    })();

    // Create content menu element
    const target = this.shadowRoot?.querySelector?.( 'div.E.smartSettings' ) as (
      HTMLElement | null
    );
    if( !target ) return;
    const { left, top } = target.getBoundingClientRect();
    const maxWidth = document.body.clientWidth - left;

    const element: ContextMenuElement =
      document.createElement( 'context-menu' );
    element.style.cssText = `left:-5000px;top:-5000px;max-width:${maxWidth}px;opacity:0;`; // Need rendered element with max-width to calculate height

    // Setup of properties
    element.containsFilter = this.containsFilter;
    element.unicodeDomain = punycode.toUnicode( this.domain || '' );
    element.domain = this.domain;

    // Append node to body
    document.body.append( element );

    await new Promise( resolve => { setTimeout( resolve, 0 ); });

    const elementTop = top - element.offsetHeight - 8;

    element.style.cssText = `left:${left}px;max-width:${maxWidth}px;top:${elementTop}px;`;

    this.documentClick = ({ target }: MouseEvent ) => {
      if( !( target instanceof HTMLElement ) ) return;

      const deleteNode: boolean = !target.matches( 'div.Element' );
      const doNothing: boolean =
        deleteNode && ( target === element || element.contains( target ) )
        || target.matches( 'popup-help, popup-help *' );
      if( doNothing ) return;

      if( deleteNode ) element.remove();
      if( this.documentClick ) {
        document.removeEventListener( 'mousedown', this.documentClick );
        delete this.documentClick;
      }
    };
    document.addEventListener(
      'mousedown',
      ( this.documentClick/*: MouseEventListener*/ )
    );
  }

  /** @method */
  telegramClick() {
    jitsu.track( 'mainmenu_telegram' );
  }
};
customElements.define( 'index-menu', IndexMenu );


export default IndexMenu;
