/* global DiagnosticsStepState, Extension, ExtensionInfo, LitUpdatedChanges */
import animateBodyScrollTop from './tools/animateBodyScrollTop';
import DiagnosticsCore from './tools/DiagnosticsCore';
import disableExtensions from './disableExtensions';
import render from './blockTemplate';
import sendMessage from 'tools/sendMessage';
import { LitElement, PropertyValues } from 'lit';
import './extensions';
import './logs';
import './stepState';
import './summary';


const { _ } = self;


type BrowserExtension = typeof chrome;


const mobileView: boolean = ( () => {
  const hasTouch =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const mobileOs =
    /android [0-9]/i.test( navigator.userAgent )
    || /iphone;/i.test( navigator.userAgent )
    || /ipad;/i.test( navigator.userAgent )
    || /ipod;/i.test( navigator.userAgent );

  return hasTouch && mobileOs;
})();


( async() => {
  const possibleSteps/*: string[]*/ = await DiagnosticsCore.getSteps();
  const initialDiagnosticsState/*: Array<DiagnosticsStepState>*/ =
    await DiagnosticsCore.getState();

  class MainBlock extends LitElement {
    allStepsComplete: boolean;
    extensions: Extension[]; // @ts-ignore
    listener: ( state: DiagnosticsStepState[] ) => any;
    noStepsStarted: boolean;
    runningSteps: boolean;
    state: DiagnosticsStepState[];

    render() {
      return render.call( this, { possibleSteps });
    }

    // Properties
    get extensionsVisible() {
      return Boolean( this.extensions.length );
    }

    get blockedByAntivirus() {
      if( !this.allStepsComplete ) {
        return false;
      }

      const httpProxyStep = this.state.find( ({ name }) => name === 'httpProxyConnection' );

      if( !httpProxyStep || httpProxyStep.state !== 'error' ) {
        return false;
      }

      if( httpProxyStep.errors ) {
        return httpProxyStep.errors.some( ( error ) => {
          return error.includes( 'forbidden by antivirus' );
        });
      }

      return false;
    }

    static get properties() {
      return {
        // States of steps (natural order)
        'noStepsStarted': {
          'type': Boolean
        },
        'runningSteps': {
          'type': Boolean
        },
        'allStepsComplete': {
          'type': Boolean,
          'observer': 'observeAllStepsComplete'
        },

        'extensions': {
          'type': Array /** @type {Array<Extension>} */
        },
        'extensionsVisible': {
          'type': Boolean
        },
        'blockedByAntivirus': {
          'type': Boolean
        },
        // List of states of each step
        'state': {
          'type': Array
        }
      };
    }

    // Lifecycle
    constructor() {
      super();

      this.allStepsComplete = initialDiagnosticsState.every(
        ({ state }) => ![ 'not started', 'in process' ].includes( state )
      );
      this.extensions = [];
      this.noStepsStarted = initialDiagnosticsState.every(
        ({ state }) => state === 'not started'
      );
      this.runningSteps = initialDiagnosticsState.some(
        ({ state }) => [ 'not started', 'in process' ].includes( state )
      ) && _.uniq( initialDiagnosticsState.map( ({ state }) => state ) ).length > 1;
      this.state = initialDiagnosticsState;
    }

    /** @method */
    async disconnectedCallback() {
      super.disconnectedCallback();

      await DiagnosticsCore.terminate();
      DiagnosticsCore.removeListener( this.listener );
    }

    /** @method */
    async firstUpdated( changedProperties: PropertyValues<any> ) {
      super.firstUpdated( changedProperties );

      this.listener = ( state: DiagnosticsStepState[] ) => {
        state = _.cloneDeep( state );
        this.state = state;


        this.extensions = ( ()/*: Extension[] */ => {
          let block/*: Extension[] | void*/ =
            [ 'proxyApi', 'noProxyExtensions' ]
              .flatMap( blockName => {
                let extensions =
                  state.find( ({ name }) => name === blockName )?.extensions;

                return Array.isArray( extensions ) ? [ extensions ] : [];
              })
              .find( list => list.length );

          return block || [];
        })();

        this.noStepsStarted = state.every(
          ({ state }) => state === 'not started'
        );

        this.runningSteps =
          state.some(
            ({ state }) => [ 'not started', 'in process' ].includes( state )
          ) && _.uniq( state.map( ({ state }) => state ) ).length > 1;

        this.allStepsComplete = state.every(
          ({ state }) => ![ 'not started', 'in process' ].includes( state )
        );
      };

      DiagnosticsCore.addListener( this.listener );
    }

    /** @method */
    // @ts-ignore
    async updated( changes: LitUpdatedChanges<MainBlock> ) {
      if( changes.has( 'allStepsComplete' ) ) {
        let newState = this.allStepsComplete;
        let oldState = changes.get( 'allStepsComplete' );
        if( !newState || oldState ) return;

        await this.requestUpdate();

        const element = this.shadowRoot?.querySelector?.( 'c-summary' ) as (
          HTMLElement | null
        );
        if( !element ) return;

        let scrollHeight/*: integer*/ = document.body?.scrollHeight ?? 0;
        let offsetHeight/*: integer*/ = document.body?.offsetHeight ?? 0;
        if( scrollHeight <= offsetHeight ) return;

        animateBodyScrollTop( scrollHeight - offsetHeight, 750 );
      }
    }

    // Methods
    /** @method */
    closePage()/*: void*/ {
      self.close();
      sendMessage({ 'type': 'Diagnostics.close' });
    }

    /** @method */
    extensionsUpdate({ 'detail': extensions }: { 'detail': Extension[] }) {
      this.extensions = extensions;
    }

    /** @method */
    async fixExtensions() {
      let extensions/*: Array<ExtensionInfo>*/ = await disableExtensions(
        this.extensions.map( ({ id }) => id )
      );

      this.extensions = [];

      // Recheck all again
      await DiagnosticsCore.terminate();
      DiagnosticsCore.start( extensions );
    }

    /** @method */
    async startDiagnostics() {
      const allowed: boolean = await ( () => {
        if( typeof browser !== 'undefined' ) {
          if( mobileView ) return true; // Firefox for Android has no support for optional management permission

          return browser.permissions.request({ 'permissions': [ 'management' ] });
        }

        return chrome.permissions.request({ 'permissions': [ 'management' ] });
      })();

      if( !allowed ) return;

      const extensions: ExtensionInfo[] | undefined = await ( async() => {
        if( typeof browser !== 'undefined' ) {
          if( mobileView ) return;

          return browser.management.getAll();
        }

        // Create iframe only for chrome
        const chromeObject: BrowserExtension = await ( async() => {
          if( typeof chrome.management.getAll === 'function' ) return chrome;

          const iframe = document.createElement( 'iframe' );
          iframe.id = 'managementIframe';

          await new Promise<void>( resolve => {
            iframe.addEventListener( 'load', () => { resolve(); });
            iframe.style.cssText =
              'position:absolute;top:-5000px;left:-5000px;width:1px;height:1px;';
            iframe.src = '/pages/management/management.html';

            document.body.append( iframe );
          });

          // @ts-ignore
          return iframe.contentWindow.chrome as BrowserExtension;
        })();

        return new Promise<ExtensionInfo[]>( resolve => {
          chromeObject.management.getAll( resolve );
        });
      })();

      await DiagnosticsCore.terminate();
      DiagnosticsCore.start( extensions );
    }
  };
  customElements.define( 'main-block', MainBlock );
})();
