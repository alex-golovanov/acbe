/* global LoginError, NodeListOf */
import actions from '../tools/actions';
import { browsecLink } from 'general/tools';
import createTranslation from '../tools/createTranslationObject';
import jitsu from 'jitsu';
import pageLinks from 'pageLinks';
import render from './loginTemplate';
import store from 'store';
import { LitElement, PropertyValues } from 'lit';
import { connect } from 'pwa-helpers/connect-mixin';


type MainLoginTranslations = {
  [ key: string ]: string | { [ key: string ]: string }
};


let translations: MainLoginTranslations = createTranslation({
  'dontHaveAnAccount': 'dont_have_an_account',
  'email': 'email',
  'forgotYourPassword': 'forgot_your_password',
  'password': 'password',
  'signIn': 'sign_in',
  'signInTitle': 'sign_in_title',
  'signUp': 'sign_up',
  'welcomeBack': 'welcome_back',
  'errors': {
    'incorrectEmailOrPassword': 'incorrect_email_or_password',
    'noConnection': 'authentication_error_no_connection',
    'thisAccountIsLocked': 'this_account_is_locked_please_contact_us'
  }
});


// @ts-ignore
class MainLogin extends connect( store )( LitElement ) { // @ts-ignore
  elements: {
    'mail': HTMLInputElement,
    'password': HTMLInputElement
  };
  error: boolean; // @ts-ignore
  errorView: HTMLElement;
  loading: boolean; // @ts-ignore
  notice: string | null; // @ts-ignore
  requestUpdate: () => Promise<void>;

  render() {
    return render.call( this );
  }
  static get properties() {
    return {
      'links': {
        'type': Object
      },
      'loading': {
        'type': Boolean
      },
      'translations': {
        'type': Object
      },

      // Notifications
      'error': {
        'type': Boolean
      },
      'notice': {
        'type': String
      }
    };
  }

  // Properties
  get links() {
    const storeState = store.getStateSync();

    return { // In fact must be just pure getter
      'resetPassword': browsecLink({
        'url': pageLinks.resetPassword,
        storeState,
      }),
      'signUp': browsecLink({
        'url': pageLinks.newUser,
        storeState,
      })
    };
  }
  get translations() {
    return translations;
  }

  // Lifecycle
  constructor() {
    super();

    this.loading = false;
    this.error = false;
  }

  /** @method */
  firstUpdated( changedProperties: PropertyValues<any> ) {
    super.firstUpdated( changedProperties );

    /** @function */
    const $ = ( selector: string ) => (
      this.shadowRoot?.querySelector?.( selector ) as ( HTMLInputElement | null )
    );

    const mail = $( 'input[type="text"][name="email"]' );
    const password = $( 'input[type="password"][name="password"]' );
    if( !mail || !password ) {
      throw new Error( 'No input elements in main-login' );
    }

    this.elements = { mail, password };

    // Popup close after link click for FF and early Chrome
    const collection =
      this.shadowRoot?.querySelectorAll?.( 'a' ) as NodeListOf<HTMLAnchorElement>;
    for( const element of collection ) {
      element.addEventListener( 'click', async() => {
        await new Promise( resolve => { setTimeout( resolve, 50 ); });
        if( self?.close ) self.close();
      });
    }

    this.elements.mail.focus();
  }

  // Methods
  /** @method */
  forgotPasswordClick() {
    jitsu.track( 'signin_forgot' );
  }

  /** @method */
  async formSubmit( event: Event ): Promise<void> {
    event.preventDefault();
    if( this.loading ) return;

    jitsu.track( 'signin_submit' );

    this.loading = true;
    if( this.errorView ) {
      const nodes: Node[] = Array.from( this.errorView.childNodes );
      nodes.forEach( node => { this.errorView.removeChild( node ); });
    }
    this.error = false;
    this.notice = null;

    let email: string = this.elements.mail.value;
    let password: string = this.elements.password.value;

    try {
      await actions.login({ email, password });

      this.notice = translations.welcomeBack as string;
      ( async() => {
        await this.requestUpdate();

        let noticeView =
          this.shadowRoot?.querySelector?.( 'div.Notice' ) as ( HTMLElement | null );
        if( !noticeView ) throw new Error( 'No notiveCiew in main-login' );

        noticeView.style.cssText = 'opacity: 0';

        let animation = noticeView.animate(
          [
            { 'opacity': 0 },
            { 'opacity': 1 }
          ],
          { 'duration': 200, 'easing': 'linear' }
        );
        await new Promise( resolve => { animation.onfinish = resolve; });

        noticeView.style.cssText = '';
      })();

      await new Promise( resolve => { setTimeout( resolve, 1000 ); });

      store.dispatch({ 'type': 'Page: set', 'page': 'index:home' });
    }
    catch ( error ) {
      let { status, responseText }: LoginError = error;

      let responseData: { [ key: string ]: any } = {};
      try {
        if( responseText ) responseData = JSON.parse( responseText );
      }
      catch ( error ) {}

      let property: string = ( () => {
        if( status !== 401 ) return 'noConnection';
        if( responseData.error_code === 8 ) return 'thisAccountIsLocked';
        return 'incorrectEmailOrPassword';
      })();
      let errorText: string =
        ( translations.errors as ({ [ key: string ]: string }) )[ property ];
      this.error = true;
      if( status === 401 ) this.elements.password.value = '';

      jitsu.track( 'signin_error' );

      await this.requestUpdate();

      let element = this.shadowRoot?.querySelector?.( 'div.Error' ) as (
        HTMLElement | null
      );
      if( !element ) throw new Error( 'No errorView in main-login' );
      this.errorView = element;

      {
        let nodes: Node[] = errorText.split( /\n/g )
          .flatMap( ( text: string, index, array ) => {
            let carry = [];
            if( text.trim() ) carry.push( document.createTextNode( text ) );
            if( index !== array.length - 1 ) {
              carry.push( document.createElement( 'br' ) );
            }
            return carry;
          });

        nodes.forEach( node => { this.errorView.appendChild( node ); });
      }

      this.errorView.style.cssText = 'opacity: 0';

      const animation = this.errorView.animate(
        [
          { 'opacity': 0 },
          { 'opacity': 1 }
        ],
        { 'duration': 200, 'easing': 'linear' }
      );
      await new Promise( resolve => { animation.onfinish = resolve; });

      this.errorView.style.cssText = '';
    }

    this.loading = false;
  }

  /** @method */
  onAnimationComplete(): void {
    this.elements.mail.focus();
  }

  /** @method */
  registerClick() {
    jitsu.track( 'signin_signup' );
  }
}
customElements.define( 'main-login', MainLogin );


export default MainLogin;
