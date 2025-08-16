/* global ExtensionInfo, StoreState */
// Chrome only page
import log from './log';
import pageLinks from 'pageLinks';
import sendMessage from 'tools/sendMessage';
import store from 'store';
import render from './blockTemplate';
import urlModifyParameters from 'tools/urlModifyParameters';
import { LitElement, PropertyValues } from 'lit';

const { _ } = self;


type BrowserExtension = typeof chrome;
type ExtensionData = {
  'checked': boolean,
  'icon'?: string,
  'id': string,
  'name': string
};


/** @function */
const permissionRequest = async(): Promise<void> => {
  const allowed: boolean = await chrome.permissions.request({ 'permissions': [ 'management' ] });

  if( !allowed ) throw new Error( 'Management permission is not granted' ); // Rejection

  // Success

  // Fix for chome strange behaviour with no chrome.management.getAll after permission granted
  if( typeof chrome.management.getAll !== 'function' ) {
    const iframe = document.createElement( 'iframe' );
    iframe.id = 'managementIframe';

    await new Promise<void>( resolve => {
      iframe.addEventListener( 'load', () => { resolve(); });
      iframe.style.cssText =
        'position:absolute;top:-5000px;left:-5000px;width:1px;height:1px;';
      iframe.src = '/pages/management/management.html';

      document.body.append( iframe );
    });
  }
};


/** @function */
const proxyDisableBrokenMode = async() => {
  let { success, 'error': errorData } =
    await sendMessage({ 'type': 'proxy disable broken mode' });
  if( success ) return success;

  let { message } = errorData;
  let error: Error & { [ key: string ]: any } = new Error( message );
  Object.keys( errorData ).forEach( key => {
    error[ key ] = errorData[ key ];
  });

  throw error;
};


class MainBlock extends LitElement { // @ts-ignore
  browsecLink: (
    url: string,
    action?: (
      search: { [ key: string ]: string | number | boolean }
    ) => { [ key: string ]: string | number | boolean }
  ) => string;
  extensions: ExtensionData[];
  hasManagement: boolean;
  logoUrl: string;
  mode: 'information' | 'success' | 'error';

  render() {
    return render.call( this );
  }
  static get properties() {
    return {
      'contactSupportUrl': {
        'type': String
      },
      'extensions': {
        'type': Array
      },
      'hasManagement': {
        'type': Boolean
      },
      'logoUrl': {
        'type': String
      },
      'mode': {
        'type': String
      }
    };
  }

  // Properties
  /** @method */
  get contactSupportUrl() {
    return this.browsecLink( pageLinks.contactUs );
  }

  // Lifecycle
  constructor() {
    super();

    this.extensions = [];
    this.hasManagement = false;
    this.logoUrl = '';
    this.mode = 'information';

    ( async() => {
      let storeState: StoreState = await store.getStateAsync();

      /** @method */
      this.browsecLink = (
        url: string,
        action: ( search: { [ key: string ]: string | number | boolean }) => { [ key: string ]: string | number | boolean } = search => search
      ): string => {
        /** @function */
        const daysAction = (
          search: { [ key: string ]: string | number | boolean }
        )/*: Object*/ => Object.assign(
          action( search ),
          { 'instd': storeState.daysAfterInstall }
        );

        return urlModifyParameters( url, daysAction );
      };

      this.logoUrl = this.browsecLink(
        'https://browsec.com/?utm_source=chromium+extension&utm_medium=logo_link&utm_campaign=default_campaign'
      );
    })();
  }

  /** @method */
  async firstUpdated( changedProperties: PropertyValues<any> ) {
    super.firstUpdated( changedProperties );

    let { permissions }: { 'permissions': string[] } =
      await new Promise( ( resolve ) => {
        chrome.permissions.getAll( resolve );
      });

    // Shows "Fix proxy settings" button, if permission is not granted yet
    if( !permissions.includes( 'management' ) ) return;

    this.hasManagement = true;
    this.getExtensionsList(); // lists the extensions to turn off
  }

  // Methods
  /** @method */
  async disableExtensions()/*: Promise<void>*/ {
    let extensions/*: Array<ExtensionData>*/ =
      this.extensions.filter( ({ checked }) => checked );
    if( extensions.length === 0 ) {
      if( this.extensions.length === 0 ) {
        proxyDisableBrokenMode();
        this.mode = 'success'; // <- No problem extensions = success
      }
      return;
    }

    await permissionRequest();

    /* Disable every extension, and after all of the selected are disabled,
    proceed to show success page */
    let promises/*: Array<Promise<void>>*/ = extensions.map(
      ({ id }) => new Promise( resolve => {
        const chromeObject: BrowserExtension | undefined = ( () => {
          if( typeof chrome.management.setEnabled === 'function' ) return chrome;

          const iframe =
            document.querySelector( '#managementIframe' ) as ( HTMLIFrameElement | null ); // @ts-ignore
          if( iframe ) return iframe.contentWindow.chrome;
        })();

        if( chromeObject ) chromeObject.management.setEnabled( id, false, resolve );
      })
    );

    try {
      await Promise.all( promises );
      try {
        await proxyDisableBrokenMode();
        this.mode = 'success';
        // console.log( 'Unblock proxy page: setBooleanState -> success' );
        // nodes.warningBox.fadeOut( () => { nodes.successBox.fadeIn(); });
      }
      catch ( error ) {
        this.mode = 'error';
        // console.log( 'error' );
        // nodes.warningBox.fadeOut( () => { nodes.errorBox.fadeIn(); });
      }
    }
    catch ( error ) {
      this.mode = 'error';
      log.error( 'Unblock proxy error: ', error );
      // nodes.warningBox.fadeOut( () => { nodes.errorBox.fadeIn(); });
    }
  }

  /** Checkbox click
  @method */
  extensionCheckbox(
    { model, 'target': { checked } }:
    { 'model': any, 'target': { 'checked': boolean } }
  ): void {
    // Actual object of <tr> line
    let extension: ExtensionData = model.get( 'item' );
    let index/*: integer*/ = this.extensions.indexOf( extension );
    let extensions: ExtensionData[] = _.cloneDeep( this.extensions );

    extensions[ index ].checked = checked;
    this.extensions = extensions; // Render here
  }

  /** @method */
  async getExtensionsList()/*: Promise<void>*/ {
    let data: ExtensionInfo[] = await new Promise( resolve => {
      const chromeObject: BrowserExtension | undefined = ( () => {
        if( typeof chrome.management.getAll === 'function' ) return chrome;

        const iframe =
          document.querySelector( '#managementIframe' ) as ( HTMLIFrameElement | null ); // @ts-ignore
        if( iframe ) return iframe.contentWindow.chrome;
      })();

      if( chromeObject ) chromeObject.management.getAll( resolve );
    });

    const extensions: ExtensionData[] = [];
    for( const { enabled, icons, id, name, permissions } of data ) {
      if( !permissions.includes( 'proxy' ) ) continue; // Ignore not proxy extensions
      if( chrome.runtime.id === id ) continue; // Ignore our extension
      if( !enabled ) continue; // Exclude disabled extensions

      const extension: ExtensionData = { 'checked': true, id, name };

      const icon = icons[ 1 ] || icons[ 0 ];
      if( icon?.url ) {
        extension.icon = `chrome://favicon/size/38/chrome-extension://${id}/`;
      }

      extensions.push( extension );
    }

    this.extensions = extensions;
  }

  /** First click here
  @method */
  async scanExtensions()/*: Promise<void>*/ {
    // Extra check of proxy control
    // if true we have control over proxy
    const state: boolean =
      await sendMessage({ 'type': 'proxy.isControlled' });

    /** @function */
    let makeRequest = async()/*: Promise<void>*/ => {
      await permissionRequest();

      if( this.mode !== 'information' ) this.mode = 'information';
      this.hasManagement = true;
      this.getExtensionsList();
    };

    if( state ) { // Strnage, but we have control over proxy
      try {
        await proxyDisableBrokenMode();
        this.mode = 'success';
      }
      catch ( error ) {
        makeRequest();
      }
      return;
    }

    // No control over proxy
    makeRequest();
  }
}
customElements.define( 'main-block', MainBlock );


export default MainBlock;
