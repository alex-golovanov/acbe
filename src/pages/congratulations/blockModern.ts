import render from './blockModernTemplate';
import store from 'store';
import { LitElement } from 'lit';
import { connect } from 'pwa-helpers/connect-mixin';
import './useAnimation';


class MainBlock extends connect( store as any )( LitElement ) {
  withScroll: boolean;

  render() {
    return render.call( this );
  }

  static get properties() {
    return {
      'withScroll': {
        'type': Boolean
      }
    };
  }

  constructor() {
    super();

    this.withScroll =
      document.documentElement.scrollHeight > document.documentElement.clientHeight;

    window.addEventListener( 'resize', () => {
      const newState =
        document.documentElement.scrollHeight > document.documentElement.clientHeight;
      if( newState === this.withScroll ) return;

      this.withScroll = newState;
    });
  }
}
customElements.define( 'main-block-modern', MainBlock );


export default MainBlock;
