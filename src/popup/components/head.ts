/* global StoreAccount, StoreGuestAccount, StoreState */
import actions from '../tools/actions';
import jitsu from 'jitsu';
import render from './headTemplate';
import store from 'store';
import { connect } from 'pwa-helpers/connect-mixin';
import { LitElement } from 'lit';
import './head/logo';


// @ts-ignore
class MainHead extends connect( store )( LitElement ) {
  indexPage: boolean;
  hideLogin: boolean;
  user: StoreAccount;

  render() {
    return render.call( this );
  }
  static get properties() {
    return {
      'user': {
        'type': Object
      },
      'indexPage': {
        'type': Boolean
      },
      'hideLogin': {
        'type': Boolean
      }
    };
  }

  // Store
  /** @method */
  stateChanged({ user, page }: StoreState ): void {
    this.user = user;
    this.indexPage = page.split( ':' )[ 0 ] === 'index';
  }

  // Lifecycle
  constructor() {
    super();

    this.user = { 'type': 'guest', 'premium': false } as StoreGuestAccount;
    this.indexPage = true;
    this.hideLogin = false;
  }

  // Methods
  /** @method */
  back(): void {
    jitsu.track( 'signin_back' );

    store.dispatch({ 'type': 'Page: set', 'page': 'index:home' });
  }

  /** @method */
  login(): void {
    jitsu.track( 'signin' );

    store.dispatch({ 'type': 'Page: set', 'page': 'login' });
  }

  /** @method */
  logout(): void {
    jitsu.track( 'signout' );

    actions.logout();
  }
}
customElements.define( 'main-head', MainHead );


export default MainHead;
