/* global LitUpdatedChanges, StoreState */
import DelayRecord from 'DelayRecord';
import highLevelPac from 'highLevelPac';
import jitsu from 'jitsu';
import render from './main-indexTemplate';
import sendMessage from 'tools/sendMessage';
import { getDefaultCountry } from 'tools/getDefaultCountry';
import storage from 'storage';
import store from 'store';
import { connect } from 'pwa-helpers/connect-mixin';
import { LitElement, PropertyValues } from 'lit';
import './index/filters';
import './index/home';
import './index/locations';
import './index/menu';
import './index/reanimator';
import './index/settings';
import './switch';


// @ts-ignore
class MainIndex extends connect( store )( LitElement ) { // @ts-ignore
  page: string;
  preMenuView: '' | 'help' | 'switch'; // @ts-ignore
  switch: HTMLElement;
  switchOn: boolean;

  render() {
    return render.call( this );
  }
  static get properties() {
    return {
      'page': {
        'type': String
      },
      'preMenuView': {
        'type': String
      },
      'switchOn': {
        'type': Boolean
      }
    };
  }

  // Lifecycle
  constructor() {
    super();

    this.page = store.getStateSync().page; // 'index:home';
    this.preMenuView = '';
    this.switchOn = false;
  }

  /** @method */
  firstUpdated( changedProperties: PropertyValues<any> ) { // : Map<string, any>
    super.firstUpdated( changedProperties );

    const shadowRoot = this.shadowRoot as ShadowRoot;
    const element =
      shadowRoot.querySelector( 'div.Switch' ) as ( HTMLElement | null );
    if( !element ) throw new Error( 'main-index shadowRoot is empty' );
    this.switch = element;

    this.switch.append( document.createElement(
      store.getStateSync().page.replace( /\:/g, '-' )
    ) );
  }

  /** @method */
  // @ts-ignore
  async updated( changes: LitUpdatedChanges<MainIndex> ) {
    if( !changes.has( 'page' ) ) return;

    const newValue: string = this.page;
    const oldValue: string = changes.get( 'page' );
    if( !oldValue ) return; // Initial redux call

    const newPageExtra = newValue.split( ':' );
    const oldPageExtra = oldValue.split( ':' );

    if( newPageExtra[ 0 ] !== 'index' ) return; // This will remove this element


    const mode = store.getStateSync().userPac.mode;

    // Remove first elements (they 'index' anyway)
    const newPage = newPageExtra.slice( 1 );
    const oldPage = oldPageExtra.slice( 1 );

    const direction: string = newPage[ 0 ] === 'home' ? 'left' : 'right';
    const sameElement: boolean = newPage[ 0 ] === oldPage[ 0 ];

    const oldElement = this.switch.firstElementChild as (
      HTMLElement & {
        'country'?: string | null,
        'domain'?: string,
        'selectedDomain'?: null
      } | null
    );
    if( !oldElement ) throw new Error( 'main-index has no child elements' );

    const defaultCountry = await getDefaultCountry();

    if( sameElement ) {
      if( newPage[ 0 ] === 'filters' && newPage[ 1 ] ) {
        const domain: string = newPage[ 1 ];

        oldElement.country = mode === 'proxy' ? null : defaultCountry;
        oldElement.domain = domain;
        oldElement.selectedDomain = null;
      }
    }
    else {
      const name = ( () => {
        switch( newPage[ 0 ] ) {
          case 'filters': return 'index-filters';
          case 'home': return 'index-home';
          case 'locations': return 'index-locations';
          case 'reanimator': return 'index-reanimator';
          case 'settings': return 'index-settings';
          case 'smart settings hint': return 'smart-settings-hint';
        }
      })();
      if( !name ) return;

      const newElement = document.createElement( name ) as (
        HTMLElement & { 'country'?: string | null, 'domain'?: string }
      );

      if( newPage[ 0 ] === 'locations' && newPage[ 1 ] ) {
        newElement.domain = newPage[ 1 ];
      }
      if( newPage[ 0 ] === 'filters' && newPage[ 1 ] ) {
        newElement.domain = newPage[ 1 ];
        newElement.country = mode === 'proxy' ? null : defaultCountry;
      }

      if( direction === 'left' ) {
        this.switch.prepend( newElement );
        this.switch.style.cssText = 'margin-left:-100%;';
      }
      else {
        this.switch.append( newElement );
      }

      // Chrome bug: delay on animation's start
      if( typeof browser === 'undefined' ) {
        await new Promise( resolve => { setTimeout( resolve, 0 ); });
      }

      const animation = this.switch.animate(
        [
          { 'marginLeft': direction === 'left' ? '-100%' : '0%' },
          { 'marginLeft': direction === 'left' ? '0%' : '-100%' }
        ],
        { 'duration': 250, 'easing': 'linear' }
      );

      await new Promise( ( resolve, reject ) => {
        animation.onfinish = resolve;
      });

      if( newPage[ 0 ] === 'locations' && !newPage[ 1 ] ) {
        jitsu.track( 'countries' );
      }

      oldElement.remove();
      this.switch.style.cssText = '';

      // FF 86 no focus bug
      if( typeof browser !== 'undefined' && name === 'index-locations' ) {
        const element =
          newElement.shadowRoot?.querySelector?.( '.In' ) as (
            HTMLElement | null
          );
        element?.focus?.();
      }
    }
  }

  /** @method */
  stateChanged({ domain, 'userPac': pac, page }: StoreState ): void {
    this.page = page;
    this.preMenuView = ( () => {
      const [ part0, part1 ] = page.split( ':' );
      if( part0 === 'index' && part1 === 'filters' ) return 'help';
      if( part0 === 'index' && part1 === 'smart settings hint' ) return 'help';

      if( !domain ) return 'switch';

      const domains: string[] = [];
      for( const item of pac.filters ) {
        if( item.disabled || item.format === 'regex' ) continue;
        domains.push( item.value );
      }

      return domains.includes( domain ) ? '' : 'switch';
    })();
    this.switchOn = pac.mode === 'proxy';
  }

  // Methods
  /** @method */
  openHelp()/*: void*/ {
    sendMessage({
      'type': 'counters.increase',
      'property': 'popup: smart settings: open help'
    });
    sendMessage({
      'type': 'create tab',
      'options': '/pages/help/help.html'
    });
  }

  /** @method */
  async switchClick()/*: void*/ {
    const reanimatorActive = await storage.get( 'reanimator: in progress' );
    if( reanimatorActive ) return;

    const delay = new DelayRecord(
      'Big switch from ' + ( this.switchOn ? 'on' : 'off' )
    );

    if( !this.switchOn ) await highLevelPac.enable();
    else {
      await highLevelPac.disable();
      jitsu.track( 'vpnOff' );
    }

    delay.end();
  }
};
customElements.define( 'main-index', MainIndex );


export default MainIndex;
