/* global DiagnosticsStepState, ExtensionInfo */
import close from './close';
import open from './open';
import possibleSteps from './possibleSteps';
import start from './start';


export class Diagnostics {
  _listeners: Array<( states: DiagnosticsStepState[] ) => any>;
  _states: DiagnosticsStepState[];
  _stamp: integer;

  constructor() {
    this._listeners = [];

    // States of loading of each specific test
    this._states = possibleSteps.map(
      ( name: string ): DiagnosticsStepState => (
        { name, 'state': 'not started' }
      )
    );

    // Stamp used to get current iteration
    this._stamp = Math.floor( Math.random() * 1000000000 );
  }

  
  /** Close all opened dignostic pages
  @method */
  close(): Promise<void> {
    return close.call( this );
  }

  /** Open diagnostics page
  @method */
  open() {
    return open.call( this );
  }

  /** Start process of diagnostics
  @method */
  start( extensions?: ExtensionInfo[] ): void {
    return start.call( this, extensions );
  }

  /** Terminate process of diagnostics if user closes page
  @method */
  terminate() {
    // Reset states
    this._states = possibleSteps.map( name => ({
      name, 'state': 'not started'
    }) );
    this._listeners.forEach( listener => { listener( this._states ); });

    // Renew stamp
    this._stamp = Math.floor( Math.random() * 1000000000 );
  }


  /** Get list of possible steps in this browser
  @method */
  getSteps(): readonly string[] {
    return possibleSteps;
  }

  /** Get current state
  @method */
  getState(): DiagnosticsStepState[] {
    return this._states;
  }

  /** @method */
  addListener(
    listener: ( states: DiagnosticsStepState[] ) => any
  ): void {
    this._listeners.push( listener );
  }

  /** @method */
  removeListener(
    listener: ( states: DiagnosticsStepState[] ) => any
  ): void {
    this._listeners = this._listeners.filter( item => item !== listener );
  }
};


export default new Diagnostics();


