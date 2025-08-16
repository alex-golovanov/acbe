/* global LitUpdatedChanges */
import render from './stepStateTemplate';
import { LitElement } from 'lit';


class StepState extends LitElement {
  completion: string;
  state: string;

  render() {
    return render.call( this );
  }
  static get properties() {
    return {
      'completion': {
        'type': String
      },
      'state': {
        'type': String
      }
    };
  }

  // Lifecycle
  constructor() {
    super();

    this.completion = '';
    this.state = 'not started';
  }

  /** @method */
  // @ts-ignore
  updated( changes: LitUpdatedChanges<StepState> ) {
    if( changes.has( 'state' ) ) {
      let newClass/*: string*/ = ( () => {
        switch( this.state ) {
          case 'skip': return 'skip';
          case 'in process': return 'progress';

          case 'success': return 'success';
          case 'warning': return 'warning';
          case 'error': return 'error';
          default: return '';
        }
      })();

      [ 'skip', 'progress', 'success', 'warning', 'error' ].forEach(
        className => { this.classList.remove( className ); }
      );

      if( newClass ) this.classList.add( newClass );
    }
  }
};
customElements.define( 'step-state', StepState );


export default StepState;
