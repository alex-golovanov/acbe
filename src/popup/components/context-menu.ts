/* global LitUpdatedChanges, StoreState */
import ga from 'ga';
import highLevelPac from 'highLevelPac';
import jitsu from 'jitsu';
import PopupPremiumOneRule from './popups/premium-onerule';
import punycode from 'punycode'; // eslint-disable-line n/no-deprecated-api
import render from './context-menuTemplate';
import sendMessage from 'tools/sendMessage';
import store from 'store';
import { LitElement } from 'lit';
import { connect } from 'pwa-helpers/connect-mixin';


class ContextMenu extends connect( store as any )( LitElement ) {
  containsFilter: boolean | null;
  domain: string; // @ts-ignore
  showEditSmartSettings: boolean;
  unicodeDomain: string;
  
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
      'showEditSmartSettings': {
        'type': Boolean
      },
      'unicodeDomain': {
        'type': String
      }
    };
  }

  // Lifecycle
  constructor() {
    super();

    this.containsFilter = null;
    this.domain = '';
    this.unicodeDomain = '';
  }

  /** @method */
  // @ts-ignore
  async updated( changes: LitUpdatedChanges<ContextMenu> ) {
    if( changes.has( 'domain' ) ) {
      if( !this.domain ) return;
      this.unicodeDomain = punycode.toUnicode( this.domain );
    }
  }

  /** @method */
  stateChanged({ page }: StoreState ): void {
    const parts: string[] = page.split( ':' );

    this.showEditSmartSettings =
      parts[ 0 ] !== 'index' || parts[ 1 ] !== 'filters';
  }

  // Methods
  /** @method */
  addFilter(): void {
    jitsu.track( 'smartSettings_menu_add' );

    let {
      'userPac': { filters }, 'user': { 'premium': premiumUser }
    }: StoreState = store.getStateSync();

    if( premiumUser || !filters.length ) {
      // Moving to filters page with specific domain
      store.dispatch({
        'type': 'Page: set',
        'page': 'index:filters:' + this.domain
      });
    }
    else this.showPremiumPopup();

    this.remove();
  }

  /** @method */
  editSettings(): void {
    jitsu.track( 'smartSettings_menu_edit' );

    sendMessage({
      'type': 'counters.increase',
      'property': 'popup: smart settings: open list'
    });

    store.dispatch({ 'type': 'Page: set', 'page': 'index:filters' });
    this.remove();
  }

  /** @method */
  openHelp(): void {
    jitsu.track( 'smartSettings_menu_help' );

    sendMessage({
      'type': 'counters.increase',
      'property': 'popup: smart settings: open help'
    });
    sendMessage({
      'type': 'create tab',
      'options': '/pages/help/help.html'
    });

    this.remove();
  }

  /** @method */
  removeFilter(): void {
    highLevelPac.siteFilters.remove( this.domain );
    this.remove();
  }

  /** @method */
  async showPremiumPopup(): Promise<void> {
    const popupPremium =
      document.createElement( 'popup-premium-onerule' ) as PopupPremiumOneRule;
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
  }
};
customElements.define( 'context-menu', ContextMenu );


export default ContextMenu;
