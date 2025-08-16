/* global DiagnosticsStepState, ExtensionInfo */
// General
import Deferred from 'tools/Deferred';
import log from 'log';

// Diagnostics only
import { Diagnostics } from './index';
import possibleSteps from './possibleSteps';

// Steps
import httpConnection from './steps/httpConnection';
import httpsConnection from './steps/httpsConnection';
import browsecApi from './steps/browsecApi';
import proxyApi from './steps/proxyApi';
import noProxyExtensions from './steps/noProxyExtensions';
import httpProxyConnection from './steps/httpProxyConnection';
import httpsProxyConnection from './steps/httpsProxyConnection';


/** Start process of diagnostics
@method */
export default function(
  this: Diagnostics,
  extensions: ExtensionInfo[] | undefined
): void {
  /** @function */
  let setSingleState = ( newState: DiagnosticsStepState ): void => {
    let name/*: string*/ = newState.name;
    let index/*: integer*/ = this._states.findIndex( step => step.name === name );

    this._states[ index ] = newState;
    this._listeners.forEach( listener => { listener( this._states ); });
  };

  let currentStamp/*: integer*/ = this._stamp;

  // Deferreds which initiates step start
  let startDeferreds: { [ key: string ]: Deferred<void> } = Object.fromEntries(
    possibleSteps.map( ( stepName/*: string*/ ) => {
      let deferred: Deferred<void> = new Deferred();
      deferred.then( () => {
        setSingleState({ 'name': stepName, 'state': 'in process' });
      });

      return [ stepName, deferred ];
    })
  );
  
  // Deferreds of end state
  let endDeferreds: { [ key: string ]: Deferred<DiagnosticsStepState> } =
    Object.fromEntries(
      possibleSteps.map( ( stepName/*: string*/ ) => {
        let deferred: Deferred<DiagnosticsStepState> = new Deferred();
        deferred.then( value => {
          setSingleState( Object.assign({ 'name': stepName }, value ) );
        });

        return [ stepName, deferred ];
      })
    );

  /** @function */
  let getIndexDeferred = (
    stepName: string
  )/*: { 'index': integer, 'deferred': {| 'start': Deferred<any>, 'end': Deferred<any> |} }*/ => {
    let index/*: integer*/ = possibleSteps.indexOf( stepName );

    return {
      index,
      'deferred': {
        'start': startDeferreds[ stepName ],
        'end': endDeferreds[ stepName ]
      }
    };
  };


  // Step: Proxy API is available
  if( possibleSteps.includes( 'proxyApi' ) ) {
    let { index, deferred } = getIndexDeferred( 'proxyApi' );

    ( async() => {
      await deferred.start;

      let state = await proxyApi( extensions );
      if( currentStamp !== this._stamp ) return;

      deferred.end.resolve( state );
      log( 'Diagnostics. Proxy API: ', state );

      // Next iteration
      let nextStep/*: string | void*/ = possibleSteps[ index + 1 ];
      if( nextStep ) {
        deferred.end.then( () => { startDeferreds[ nextStep ].resolve(); });
      }
    })();
  }


  // Step: Other extensions with proxy (Chrome only)
  if( possibleSteps.includes( 'noProxyExtensions' ) ) {
    let { index, deferred } = getIndexDeferred( 'noProxyExtensions' );

    ( async() => {
      await deferred.start;

      const previousState = this._states.find( ({ name }) => name === 'proxyApi' );

      let state = await noProxyExtensions(
        extensions,
        previousState
          ? previousState.state !== 'error'
          : false
      );

      if( currentStamp !== this._stamp ) return;

      deferred.end.resolve( state );
      log( 'Diagnostics. No other proxy extensions: ', state );

      // Next iteration
      let nextStep/*: string | void*/ = possibleSteps[ index + 1 ];
      if( nextStep ) {
        deferred.end.then( () => { startDeferreds[ nextStep ].resolve(); });
      }
    })();
  }


  // Step: HTTP connection
  if( possibleSteps.includes( 'httpConnection' ) ) {
    let { index, deferred } = getIndexDeferred( 'httpConnection' );

    ( async() => {
      await deferred.start;

      let proxyApiState: DiagnosticsStepState | undefined =
        this._states.find( ({ name }) => name === 'proxyApi' );

      let state: DiagnosticsStepState = proxyApiState?.state !== 'error'
        ? await httpConnection()
        : { 'name': 'httpConnection', 'state': 'skip' }; // No need to make any tests in case of error
      if( currentStamp !== this._stamp ) return;

      deferred.end.resolve( state );
      log( 'Diagnostics. HTTP connection: ', state );

      // Next iteration
      let nextStep/*: string | void*/ = possibleSteps[ index + 1 ];
      if( !nextStep ) return;

      deferred.end.then( () => { startDeferreds[ nextStep ].resolve(); });
    })();
  }


  // Step: HTTPS connection
  if( possibleSteps.includes( 'httpsConnection' ) ) {
    let { index, deferred } = getIndexDeferred( 'httpsConnection' );

    ( async() => {
      await deferred.start;

      let proxyApiState: DiagnosticsStepState | undefined =
        this._states.find( ({ name }) => name === 'proxyApi' );

      let state: DiagnosticsStepState = proxyApiState?.state !== 'error'
        ? await httpsConnection()
        : { 'name': 'httpsConnection', 'state': 'skip' }; // No need to make any tests in case of error
      if( currentStamp !== this._stamp ) return;

      deferred.end.resolve( state );
      log( 'Diagnostics. HTTPS connection: ', state );

      let nextStep/*: string | void*/ = possibleSteps[ index + 1 ];
      if( !nextStep ) return;

      deferred.end.then( () => { startDeferreds[ nextStep ].resolve(); });
    })();
  }


  // Step: Ajax Browsec API is available
  if( possibleSteps.includes( 'browsecApi' ) ) {
    let { index, deferred } = getIndexDeferred( 'browsecApi' );

    deferred.start
      .then( () => {
        /** @type {Boolean} */
        let condition = [ 'httpConnection', 'httpsConnection' ]
          .map( stepName => {
            let state = (
              this._states.find( ({ name }) => name === stepName ) as DiagnosticsStepState
            ).state;
            return ![ 'error', 'skip' ].includes( state );
          })
          .some( value => value );

        return condition
          ? browsecApi()
          : { 'name': 'browsecApi', 'state': 'skip' as const }; // No need to make any tests in case of error
      })
      .then( ( state: DiagnosticsStepState ) => {
        if( currentStamp !== this._stamp ) return;

        deferred.end.resolve( state );
        log( 'Diagnostics. Browsec API: ', state );

        /** @type {(String|undefined)} - Next iteration */
        let nextStep = possibleSteps[ index + 1 ];
        if( nextStep ) {
          deferred.end.then( () => { startDeferreds[ nextStep ].resolve(); });
        }
      });
  }


  // Step: Connect to proxy and make HTTP request (Chrome only)
  if( possibleSteps.includes( 'httpProxyConnection' ) ) {
    let { index, deferred } = getIndexDeferred( 'httpProxyConnection' );

    deferred.start
      .then( () => {
        /** @type {Boolean} */
        let condition = [ 'noProxyExtensions', 'proxyApi' ]
          .map( stepName => (
            (
              this._states.find( ({ name }) => name === stepName ) as DiagnosticsStepState
            ).state !== 'error'
          ) )
          .every( value => value );

        return condition
          ? httpProxyConnection()
          : { 'name': 'httpProxyConnection', 'state': 'skip' as const }; // No need to make any tests in case of error
      })
      .then( ( state: DiagnosticsStepState ) => {
        if( currentStamp !== this._stamp ) return;

        deferred.end.resolve( state );
        log( 'Diagnostics. Connect to proxy and make ajax request: ', state );

        /** @type {(String|undefined)} - Next iteration */
        let nextStep = possibleSteps[ index + 1 ];
        if( nextStep ) {
          deferred.end.then( () => { startDeferreds[ nextStep ].resolve(); });
        }
      });
  }


  // Step: Connect to proxy and make HTTP request (Chrome only)
  if( possibleSteps.includes( 'httpsProxyConnection' ) ) {
    let { index, deferred } = getIndexDeferred( 'httpsProxyConnection' );

    deferred.start
      .then( () => {
        /** @type {} */
        let condition/*: boolean*/ = [ 'noProxyExtensions', 'proxyApi' ]
          .map( stepName => (
            (
              this._states.find( ({ name }) => name === stepName ) as DiagnosticsStepState
            ).state !== 'error'
          ) )
          .every( value => value );

        return condition
          ? httpsProxyConnection()
          : { 'name': 'httpsProxyConnection', 'state': 'skip' as const }; // No need to make any tests in case of error
      })
      .then( ( state: DiagnosticsStepState ) => {
        if( currentStamp !== this._stamp ) return;

        deferred.end.resolve( state );
        log( 'Diagnostics. Connect to proxy and make ajax request: ', state );

        /** @type {(String|undefined)} - Next iteration */
        let nextStep = possibleSteps[ index + 1 ];
        if( nextStep ) {
          deferred.end.then( () => { startDeferreds[ nextStep ].resolve(); });
        }
      });
  }

  // Initial start
  startDeferreds[ possibleSteps[ 0 ] ].resolve();
};
