import render from './reanimatorTemplate';
import storage from 'storage';
import store from 'store';
import { LitElement, PropertyValues } from 'lit';
import { connect } from 'pwa-helpers/connect-mixin';


class IndexReanimator extends connect( store as any )( LitElement ) {
  removeListener?: () => any;
  step: number;

  render() {
    return render.call( this );
  }

  static get properties() {
    return {
      'step': {
        'type': Number
      },
    };
  }

  constructor() {
    super();

    this.step = 1;

    ( async() => {
      const step = await storage.get( 'reanimator: step' ) || 1;
      this.step = step;
    })();
  }

  /** @method */
  async firstUpdated( changedProperties: PropertyValues<any> ) {
    super.firstUpdated( changedProperties );

    // Listen to changes of step in background
    const unsubscribeStep = storage.onChange({
      'for': [ 'reanimator: step' ],
      'do': ( storageData: Record<string, any> ) => {
        const value = storageData[ 'reanimator: step' ];

        this.step = value;
      }
    });

    await new Promise<void>( resolve => {
      storage.get( 'reanimator: in progress' ).then( value => {
        if( value === false ) resolve();
      });

      const unsubscribeProgress = storage.onChange({
        'for': [ 'reanimator: in progress' ],
        'do': ( storageData: Record<string, any> ) => {
          const value = storageData[ 'reanimator: in progress' ];
          if( value === false ) {
            unsubscribeProgress();
            resolve();
          }
        }
      });

      this.removeListener = () => {
        unsubscribeStep();
        unsubscribeProgress();
      };
    });

    store.dispatch({ 'type': 'Page: set', 'page': 'index:home' });
  }

  /** @method */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeListener?.();
  }
};
customElements.define( 'index-reanimator', IndexReanimator );


export default IndexReanimator;
