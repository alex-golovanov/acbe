/* global Promotion, Price, StoreState */
import activeBanner from '../../objects/activeBanner';
import { browsecLink } from 'general/tools';
import defaultPrices from './defaultPrices';
import ga from 'ga';
import internationalize from 'tools/internationalize';
import jitsu from 'jitsu';
import pageLinks from 'pageLinks';
import pricesPreView from 'tools/pricesPreView';
import render from './premium-oneruleTemplate';
import sendMessage from 'tools/sendMessage';
import store from 'store';
import { LitElement } from 'lit';
import { connect } from 'pwa-helpers/connect-mixin';
import { experimentsHelper } from 'experiments';


class PopupPremiumOnerule extends connect( store as any )( LitElement ) { // @ts-ignore
  firstConnect: boolean;
  initiator?: 'locations' | 'smart settings' | 'timezone'; // @ts-ignore
  oldPrice: number; // @ts-ignore
  oldPriceString: string;
  premiumLink: string; // @ts-ignore
  price: number; // @ts-ignore
  priceString: string; // @ts-ignore
  trialDays: number;
  withPrice: boolean;

  render() {
    return render.call( this );
  }

  static get properties() {
    return {
      'buttonText': {
        'type': String
      },
      'discount': {
        'type': Number
      },
      'oldPrice': {
        'type': Number
      },
      'oldPriceString': {
        'type': String
      },
      'premiumLink': {
        'type': String
      },
      'price': {
        'type': Number
      },
      'priceString': {
        'type': String
      },
      'trialDays': {
        'type': Number
      }
    };
  }

  // Lifecycle
  constructor() {
    super();

    this.premiumLink = '';
    this.withPrice = Math.floor( Math.random() * 2 ) === 1; // Random true/false

    // this.premiumLink
    ( async() => {
      let extraText: string = this.extraText;
      if( extraText ) extraText = '. ' + extraText;

      const storeState = await store.getStateAsync();

      const now: integer = Date.now();
      const activePromotionWithTariff: Promotion | undefined =
        storeState.promotions.find( ({ isDiscount, from, till, tariffs }) => (
          isDiscount && from <= now && now <= till && tariffs?.length
        ));

      const campaign: string =
        activePromotionWithTariff?.id ?? 'default_campaign';

      const prices: Price[] = ( () => {
        if( !activePromotionWithTariff ) return defaultPrices;

        const { tariffs } = activePromotionWithTariff;
        if( !tariffs ) {
          throw new Error( 'No "tariffs" property in tariff' ); // Type crap
        }

        return tariffs.flatMap( ({ prices, duration }) => (
          prices.map( ({ currency, value }) => ({ currency, duration, value }) )
        ) );
      })();

      const plan: string = ( () => {
        const convertedTariffs = prices
          .map( ({ duration, 'value': price }) => ({
            duration,
            'pricePerMonth': price / duration
          }) )
          .sort( ({ 'pricePerMonth': a }, { 'pricePerMonth': b }) => a - b );

        const { duration } = convertedTariffs[ 0 ];

        switch( duration ) {
          case 1: return 'monthly';
          case 12: return 'annual';
          case 24: return 'biennial';
          default: throw new Error( 'Incorrect duration' );
        }
      })();

      const term: string = this.buttonText + extraText;

      const urlParams: { [ key: string ]: string } = {
        'feature': 'smartsettings',
        'plan_id': plan,
        'utm_source': 'chromium extension',
        'utm_medium': 'premium_div',
        'utm_campaign': campaign,
        'utm_term': term
      };

      const clientId: string = await ga.full.userIdPromise;
      const expvarid = await experimentsHelper.getEngagedEnabledExpvarid();

      this.premiumLink = browsecLink({
        'action': (
          search: { [ key: string ]: string | number | boolean }
        ) => Object.assign( search, urlParams ),
        storeState,
        'url': activePromotionWithTariff?.clickUrl || pageLinks.premium + '&cid=' + clientId,
        expvarid
      });
    })();
  }

  /** @method */
  async connectedCallback() {
    super.connectedCallback();
    if( this.firstConnect ) return;

    this.firstConnect = true;

    let extraText/*: string*/ = this.extraText;
    if( extraText ) extraText = '. ' + extraText;

    const { promotions } = await store.getStateAsync();

    const now = Date.now();
    const promotion = promotions.find(
      ({ from, till }) => from <= now && now <= till
    );

    ga.partial({
      'category': 'extension',
      'action': 'show_premium_div',
      'label': 'premium_div_' + this.buttonText + extraText
    });

    jitsu.track( 'premium_div', {
      'feature': 'smartsettings',
      'campaign': promotion?.id || 'default'
    });
  }

  /** @method */
  stateChanged({ prices, priceTrial }: StoreState ): void {
    // @ts-ignore
    const language = window.language as ( 'en' | 'ru' );

    const { oldPrice, oldPriceString, price, priceString, trialDays } =
      pricesPreView({ language, prices, priceTrial });

    Object.assign( this, { oldPrice, oldPriceString, price, priceString, trialDays });
  }

  // Properties
  get buttonText(): string {
    if( !this.withPrice ) {
      return internationalize( 'get_premium_now' );
    }
    if( this.trialDays ) {
      const base = internationalize( 'get_N_days_free_premium_trial' );

      return base.replace( /XXX/g, String( this.trialDays ) );
    }
    if( this.discount ) {
      return internationalize( 'get_monthly_premium' );
    }

    return internationalize( 'upgrade_to_premium' );
  }

  get discount() {
    return !this.oldPrice
      ? 0
      : Math.floor( 100 * ( this.oldPrice - this.price ) / this.oldPrice );
  }

  get extraText(): string {
    if( !this.withPrice || this.trialDays ) return '';
    if( !this.discount ) {
      const base = internationalize( 'only_X_per_month' );

      return base.replace( /XXX/g, this.priceString );
    }

    {
      const base = internationalize( 'for_only' );

      return base + ' ' + this.priceString;
    }
  }

  // Methods
  /** @method */
  async close() {
    // @ts-ignore
    if( window.animationInProgress ) return;

    // @ts-ignore
    window.animationInProgress = true;

    const animation = this.animate(
      [
        { 'top': 0 },
        { 'top': '-100%' }
      ],
      { 'duration': 800, 'easing': 'linear' }
    );
    await new Promise( resolve => { animation.onfinish = resolve; });

    this.remove();

    // @ts-ignore
    window.animationInProgress = false;
  }

  /** @method */
  async linkClick() {
    sendMessage({
      'type': 'popup-premium-onerule button click',
      'promotionId': ( () => {
        const banner = activeBanner.get();
        if( banner?.type === 'custom' ) {
          return banner.promotionId;
        }
      })()
    });

    // For FF and early Chrome
    await new Promise( resolve => { setTimeout( resolve, 50 ); });
    self?.close?.();
  }
};
customElements.define( 'popup-premium-onerule', PopupPremiumOnerule );


export default PopupPremiumOnerule;
