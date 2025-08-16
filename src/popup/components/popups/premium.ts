/* global LitUpdatedChanges, Price, StoreState */
import activeBanner from '../../objects/activeBanner';
import { browsecLink } from 'general/tools';
import defaultPrices from './defaultPrices';
import ga from 'ga';
import internationalize from 'tools/internationalize';
import jitsu from 'jitsu';
import pageLinks from 'pageLinks';
import pricesPreView from 'tools/pricesPreView';
import render from './premiumTemplate';
import sendMessage from 'tools/sendMessage';
import store from 'store';
import { LitElement } from 'lit';
import { connect } from 'pwa-helpers/connect-mixin';
import { experimentsHelper } from 'experiments';


class PopupPremium extends connect( store as any )( LitElement ) {
  country: string; // @ts-ignore
  firstConnect: boolean;
  initiator?: 'premium locations' | 'smart settings' | 'timezone change';
  gaCid: string | undefined; // @ts-ignore
  oldPrice: number; // @ts-ignore
  oldPriceString: string; // @ts-ignore
  premiumLink: string; // @ts-ignore
  price: number; // @ts-ignore
  priceString: string; // @ts-ignore
  trialDays: number;
  withPrice: boolean;

  /** @method */
  render() {
    return render.call( this );
  }

  static get properties() {
    return {
      'buttonText': {
        'type': String
      },
      'country': {
        'type': String
      },
      'discount': {
        'type': Number
      },
      'extraText': {
        'type': String
      },
      'gaCid': {
        'type': String
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
      },
      'withPrice': {
        'type': Boolean
      }
    };
  }

  // Lifecycle
  constructor() {
    super();

    this.country = '';
    this.gaCid = ( () => {
      if( typeof browser !== 'undefined' || !document.cookie ) return '';
      let part = document.cookie.split( '; ' )
        .find( item => item.startsWith( '_ga' ) );

      return part ? part.slice( 10 ) : undefined;
    })();

    this.premiumLink = '';
    this.withPrice = Math.floor( Math.random() * 2 ) === 1; // Random true/false

    // this.premiumLink
    ( async() => {
      let extraText = this.extraText;
      if( extraText ) extraText = '. ' + extraText;

      const storeState = await store.getStateAsync();

      const now: integer = Date.now();
      const activePromotionWithTariff =
        storeState.promotions.find( ({ isDiscount, from, till, tariffs }) => (
          isDiscount && from <= now && now <= till && tariffs?.length
        ) );

      const campaign = activePromotionWithTariff?.id ?? 'default_campaign';

      const prices: Price[] = ( () => {
        if( !activePromotionWithTariff ) return defaultPrices;

        const { tariffs } = activePromotionWithTariff;
        if( !tariffs ) {
          throw new Error( 'No "tariffs" property in tariff' );
        }

        return tariffs.flatMap( ({ prices, duration }) => (
          prices.map( ({ currency, value }) => ({ currency, duration, value }) )
        ) );
      })();

      const plan/*: string*/ = ( () => {
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
        'plan_id': plan,
        'utm_source': 'chromium extension',
        'utm_medium': 'premium_div',
        'utm_campaign': campaign,
        'utm_term': term
      };

      if( this.initiator ) {
        urlParams.feature = ( () => {
          switch( this.initiator ) {
            case 'premium locations': return 'countries';
            case 'smart settings': return 'smartsettings';
            case 'timezone change': return 'browser_tz';
          }
        })();
      }

      const clientId: string = await ga.full.userIdPromise;
      const expvarid = await experimentsHelper.getEngagedEnabledExpvarid();

      this.premiumLink = browsecLink({
        'action': ( search: { [ key: string ]: string | boolean | number }) => (
          Object.assign( search, urlParams )
        ),
        'url': activePromotionWithTariff?.clickUrl || pageLinks.premium + '&cid=' + clientId,
        storeState,
        expvarid
      });
    })();
  }

  /** @method */
  async connectedCallback() {
    super.connectedCallback();

    if( this.firstConnect ) return;

    this.firstConnect = true;

    let extraText: string = this.extraText;
    if( extraText ) extraText = '. ' + extraText;

    const { promotions } = await store.getStateAsync();

    const now = Date.now();
    const promotion = promotions.find(
      ({ from, till }) => from <= now && now <= till
    );

    ga.partial({
      'action': 'show_premium_div',
      'category': 'extension',
      'label': 'premium_div_' + this.buttonText + extraText
    });

    jitsu.track(
      'premium_div',
      {
        'feature': this.initiator === 'timezone change'
          ? 'browser_tz'
          : 'countries',
        'campaign': promotion?.id || 'default'
      }
    );
  }

  /** @method */
  // @ts-ignore
  updated( changes: LitUpdatedChanges<PopupPremium> ) {
    if( changes.has( 'withPrice' ) ) {
      let classList = this.classList;
      if( this.withPrice ) classList.add( 'withPrice' );
      else classList.remove( 'withPrice' );
    }
  }

  /** @method */
  stateChanged({ prices, priceTrial }: StoreState ): void {
    // @ts-ignore
    const language = window.language as ( 'en' | 'ru' );

    const { price, priceString, oldPrice, oldPriceString, trialDays } =
      pricesPreView({ language, prices, priceTrial });

    Object.assign( this, { oldPrice, oldPriceString, price, priceString, trialDays });
  }

  // Properties
  get buttonText(): string {
    if( this.withPrice ) {
      if( this.trialDays ) {
        const base = internationalize( 'get_N_days_free_premium_trial' );
        return base.replace( /XXX/g, String( this.trialDays ) );
      }
      if( this.discount ) {
        return internationalize( 'get_monthly_premium' );
      }
    }

    return internationalize( 'get_premium_now' );
  }

  get discount(): number {
    return !this.oldPrice
      ? 0
      : Math.floor( 100 * ( this.oldPrice - this.price ) / this.oldPrice );
  }

  get extraText(): string {
    if( !this.withPrice || this.trialDays ) return '';
    if( !this.discount ) {
      const base = internationalize('only_X_per_month');
      return base.replace( /XXX/g, this.priceString );
    }

    {
      const base = internationalize( 'for_only' );

      return base + ' ' + this.priceString;
    }
  }

  /** @method */
  async close(): Promise<void> {
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
  async linkClick(): Promise<void> {
    sendMessage({
      'type': 'popup-premium button click',
      'feature': this.initiator === 'timezone change'
        ? 'browser_tz'
        : 'countries',
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
customElements.define( 'popup-premium', PopupPremium );


export default PopupPremium;
