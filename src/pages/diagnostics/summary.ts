/* global DiagnosticsStepState, LitUpdatedChanges */
import render from './summaryTemplate';
import { LitElement } from 'lit';


class Summary extends LitElement {
  fixable: boolean | null;
  blockedByAntivirus: boolean | null;
  ownState: string;
  state: DiagnosticsStepState[];

  render() {
    return render.call( this );
  }
  static get properties() {
    return {
      'fixable': {
        'type': Boolean
      },
      'blockedByAntivirus': {
        'type': Boolean
      },
      'ownState': {
        'type': String
      },
      'state': {
        'type': Array
      }
    };
  }

  // Lifecycle
  constructor() {
    super();

    this.fixable = null;
    this.blockedByAntivirus = null;
    this.ownState = '';
    this.state = [];
  }

  /** @method */
  // @ts-ignore
  updated( changes: LitUpdatedChanges<Summary> ) {
    if( changes.has( 'ownState' ) ) {
      let state = this.ownState;
      let oldState = changes.get( 'ownState' );

      if( oldState ) this.classList.remove( oldState );
      if( state ) this.classList.add( state );
    }
    if( changes.has( 'state' ) ) {
      let data/*: Array<string>*/ = this.state.map( ({ state }) => state );

      let newState: string = ( () => {
        let condition/*: boolean*/ = data.some(
          state => ![ 'error', 'warning', 'success', 'skip' ].includes( state )
        );
        if( condition ) return '';

        if( data.some( state => state === 'error' ) ) return 'error';
        if( data.some( state => state === 'warning' ) ) return 'warning';
        return 'success';
      })();

      if( this.ownState !== newState ) this.ownState = newState;
    }
  }
};
customElements.define( 'c-summary', Summary );


export default Summary;
