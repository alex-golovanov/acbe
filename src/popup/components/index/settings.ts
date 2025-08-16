/* global LitUpdatedChanges, StoreState */
import Browser from 'crossbrowser-webextension';
import internationalize from 'tools/internationalize';
import ga from 'ga';
import jitsu from 'jitsu';
import log from 'log';
import permissions from '../../tools/permissions';
import PopupPremium from '../popups/premium';
import setPromotionsBlock from '../../tools/promotionsBlock';
import render from './settingsTemplate';
import sendMessage from 'tools/sendMessage';
import storage from 'storage';
import store from 'store';
import timezoneChange from '../../tools/timezoneChange';
import webrtc from '../../tools/webrtc';
import { LitElement, PropertyValues } from 'lit';
import { connect } from 'pwa-helpers/connect-mixin';
import '../checkbox-switch';


/** @function */
const privacyPermissionRequest = async(): Promise<void> => {
  if( typeof browser !== 'undefined' ) return;

  // Request only in Chrome
  let allowed: boolean = await chrome.permissions.request({ 'permissions': [ 'privacy' ] });

  if( !allowed ) throw new Error( 'Management permission is not granted' );
};


class IndexSettings extends connect( store as any )( LitElement ) { // @ts-ignore
  blockPromos: boolean; // @ts-ignore
  cacheRemoval: boolean; // @ts-ignore
  changeDateDisabledClass: string; // @ts-ignore
  changeDateElements: HTMLElement[];
  changeDateFirstTimeClass: string; // @ts-ignore
  changeDateTooltipShown: boolean; // @ts-ignore
  documentMouseMove: ( event: MouseEvent ) => any; // @ts-ignore
  hideDate: boolean;
  tooltipElement?: HTMLElement;
  premiumUser: boolean | null;
  storeWebrtcBlocked: boolean | null;
  webrtcAvailable: boolean;
  webrtcBlocked: boolean;
  webrtcBlockedByOtherExtension: boolean;
  webrtcNotEnoughPermissions: boolean;
  dontSendTelemetry: boolean;

  render() {
    return render.call( this );
  }

  static get properties() {
    return {
      'blockPromos': {
        'type': Boolean
      },
      'cacheRemoval': {
        'type': Boolean
      },
      'changeDateDisabledClass': {
        'type': String
      },
      'changeDateFirstTimeClass': {
        'type': String
      },
      'dontSendTelemetry': {
        'type': Boolean
      },
      'hideDate': {
        'type': Boolean
      },
      'storeWebrtcBlocked': {
        'type': Boolean
      },
      'premiumUser': {
        'type': Boolean
      },
      'webrtcAvailable': { // Does browser support webrtc
        'type': Boolean
      },
      'webrtcBlocked': {
        'type': Boolean
      },
      'webrtcBlockedByOtherExtension': {
        'type': Boolean
      },
      'webrtcNotEnoughPermissions': {
        'type': Boolean
      }
    };
  }

  /** @method */
  stateChanged({
    cacheRemoval, promotionsBlock, timezoneChange, user, webrtcBlock, dontSendTelemetry
  }: StoreState ): void {
    this.changeDateDisabledClass = ( () => {
      let disabled: boolean = timezoneChange && !user.premium;
      return disabled ? 'disabled' : '';
    })();

    this.blockPromos = promotionsBlock;
    this.cacheRemoval = cacheRemoval;
    this.hideDate = timezoneChange;
    this.premiumUser = user.premium;
    this.storeWebrtcBlocked = webrtcBlock;
  }

  // Lifecycle
  constructor() {
    super();

    // Method bindings
    this.computeWebrtcNotEnoughPermissions =
      this.computeWebrtcNotEnoughPermissions.bind( this );

    this.changeDateFirstTimeClass = '';
    ( async() => {
      let settingValue =
        await storage.get( 'newSettingsFeatureTimezoneChange2' );
      this.changeDateFirstTimeClass = settingValue ? '' : 'highlighted';
    })();

    this.dontSendTelemetry = false;
    ( async() => {
      let dontSendTelemetry =
        await storage.get( 'dontSendTelemetry' ) || false;
      this.dontSendTelemetry = dontSendTelemetry;
    })();

    this.storeWebrtcBlocked = null;
    this.premiumUser = null;
    this.webrtcAvailable = webrtc.available;
    this.webrtcBlocked = false;
    this.webrtcBlockedByOtherExtension = false;
    this.webrtcNotEnoughPermissions = false;
  }

  /** @method */
  async connectedCallback() {
    super.connectedCallback();

    await storage.set( 'newSettingsFeatureTimezoneChange2', true );
  }

  /** @method */
  disconnectedCallback() {
    super.disconnectedCallback();

    if( this.tooltipElement ) {
      this.tooltipElement.remove();
      delete this.tooltipElement;
    }
    if( this.documentMouseMove ) {
      document.removeEventListener( 'mousemove', this.documentMouseMove ); // @ts-ignore
      delete this.documentMouseMove;
    }
  }

  /** @method */
  firstUpdated( changedProperties: PropertyValues<any> ) {
    super.firstUpdated( changedProperties );

    this.changeDateElements = Array.from(
      this.shadowRoot?.querySelectorAll?.( '[data-changedate="true"]' ) || []
    );


    ( async() => {
      let controlState/*: 'not available' | 'permission not granted' | 'not controlled' | 'controlled'*/ =
        await webrtc.getControlState();
      if( controlState === 'not controlled' ) {
        this.webrtcBlockedByOtherExtension = true;
      }
    })();

    this.webrtcBlocked = ( () => {
      if( !store.getStateSync().webrtcBlock ) return false;
      return permissions.includes( 'privacy' );
    })();

    this.computeWebrtcNotEnoughPermissions( permissions.get() );
    permissions.addListener( this.computeWebrtcNotEnoughPermissions ); // NOTE binding needed here!
  }

  /** @method */
  // @ts-ignore
  updated( changes: LitUpdatedChanges<IndexSettings> ) {
    if( !changes.has( 'webrtcBlocked' ) ) return;
    this.computeWebrtcNotEnoughPermissions( permissions.get() );
  }

  // Computed properties and observers
  /** @method */
  computeWebrtcNotEnoughPermissions( permissions: string[] ): void {
    this.webrtcNotEnoughPermissions = ( () => {
      if( this.storeWebrtcBlocked === null ) return false;
      return this.storeWebrtcBlocked && !permissions.includes( 'privacy' );
    })();
  }

  // Methods
  /** @method */
  changeBlockPromos(): void {
    const newValue: boolean = !this.blockPromos;

    jitsu.track(
      newValue ? 'settings_nopromo_on' : 'settings_nopromo_off'
    );
    setPromotionsBlock( newValue );
  }

  /** @method */
  async changeCacheRemoval(): Promise<void> {
    const newValue: boolean = !this.cacheRemoval;

    jitsu.track(
      newValue ? 'settings_remove_cache_on' : 'settings_remove_cache_off'
    );

    if( newValue ) { // Enable cache clearing
      const { permissions } = await Browser.permissions.getAll();
      if( !permissions.includes( 'browsingData' ) ) {
        const permissionGranted: boolean =
          await new Promise( ( resolve ) => {
            chrome.permissions.request(
              { 'permissions': [ 'browsingData' ] },
              resolve
            );
          });

        if( !permissionGranted ) return;

        Browser.resetAPI( 'browsingData' );
      }
    }

    store.dispatch({
      'type': 'Cache removal: set',
      'data': newValue
    });
  }

  /** @method */
  async changeDate(): Promise<void> {
    if( !this.premiumUser && this.hideDate ) return; // Do nothing
    if( !this.premiumUser ) {
      // @ts-ignore
      if( window.animationInProgress ) return;

      // @ts-ignore
      window.animationInProgress = true;

      const popupPremium =
        document.createElement( 'popup-premium' ) as PopupPremium;
      popupPremium.initiator = 'timezone change';
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
      return;
    }

    const newValue = !this.hideDate;

    jitsu.track(
      newValue ? 'settings_browser_tz_on' : 'settings_browser_tz_off'
    );
    await timezoneChange.set( newValue );
    this.hideDate = newValue;
  }

  /** @method */
  changeDateMouseover({ target }: MouseEvent ): void {
    if( this.premiumUser || !this.hideDate ) return; // Only for not premium user with enabled timezone change
    if( this.changeDateTooltipShown ) return; // Tooltip already visible
    if( !( target instanceof HTMLElement ) ) return; // Flow crap

    this.changeDateTooltipShown = true;

    let { top, left, height } = target.getBoundingClientRect();
    top += height + 7;
    left -= 14;
    if( left < 10 ) left = 10;

    let tooltipElement = document.createElement( 'general-tooltip' ) as (
      HTMLElement & { 'text'?: string }
    );
    tooltipElement.text =
      internationalize( 'this_option_is_available_only_for_premium' );
    tooltipElement.style.cssText = `top:${top}px;left:${left}px;`;
    this.tooltipElement = tooltipElement;

    if( document.body ) document.body.append( tooltipElement );

    let possibleElements/*: Array<HTMLElement>*/ =
      this.changeDateElements.concat( [ tooltipElement ] );

    /** @method */
    this.documentMouseMove = ( event: MouseEvent ) => {
      let path: EventTarget[] = ( () => {
        if( event.composedPath ) return event.composedPath(); // @ts-ignore
        if( event.deepPath ) return event.deepPath(); // @ts-ignore
        return event.path || [ event.target ];
      })();


      let possibleElementsMove: boolean = possibleElements.some(
        element => path.includes( element )
      );
      if( possibleElementsMove ) return;

      tooltipElement.remove();
      document.removeEventListener( 'mousemove', this.documentMouseMove ); // @ts-ignore
      delete this.documentMouseMove;
      delete this.tooltipElement;

      this.changeDateTooltipShown = false;
    };

    document.addEventListener( 'mousemove', this.documentMouseMove );
  }

  /** @method */
  async changeWebrtc(): Promise<void> {
    if( this.webrtcBlockedByOtherExtension ) return;

    const blocked: boolean = !this.webrtcBlocked;
    jitsu.track(
      blocked ? 'settings_webrtc_on' : 'settings_webrtc_off'
    );
    try {
      if( blocked ) await webrtc.enable( privacyPermissionRequest );
      else await webrtc.disable( privacyPermissionRequest );

      this.webrtcBlocked = blocked;
    }
    catch ( error ) {
      log.warn( 'WebRTC setup in popup failed' );
    }
  }

  /** @method */
  async changeDontSendTelemetry(): Promise<void> {
    const dontSendTelemetry: boolean = !this.dontSendTelemetry;
    jitsu.track( 'telemetry_optout',
      dontSendTelemetry ? { 'enabled': '1' } : { 'enabled': '0' }
    );
    await storage.set( 'dontSendTelemetry', dontSendTelemetry );
    this.dontSendTelemetry = dontSendTelemetry;
  }

  /** @method */
  async openDiagnostics(): Promise<void> {
    jitsu.track( 'settings_healthcheck' );

    await sendMessage({ 'type': 'Diagnostics.open' });
    if( typeof browser !== 'undefined' ) self.close();
  }

  /** @method */
  showDateHelp(): void {
    jitsu.track( 'settings_browser_tz_help' );

    this.showInformationPopup( 'date' );
  }

  /** @method */
  showWebrtcHelp(): void {
    jitsu.track( 'settings_webrtc_help' );

    this.showInformationPopup( 'webrtc' );
  }

  /** @method */
  async showInformationPopup( theme: string ): Promise<void> {
    let parent = document.querySelector( 'div.MainContainer' ) as (
      HTMLElement | null
    );
    if( !parent ) return;

    const element = document.createElement( 'popup-description' ) as (
      HTMLElement & { 'theme'?: string }
    );
    element.theme = theme;
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
customElements.define( 'index-settings', IndexSettings );


export default IndexSettings;
