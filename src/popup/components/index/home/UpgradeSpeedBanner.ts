/* global StoreState */
import { browsecLink } from 'general/tools';
import createTranslation from '../../../tools/createTranslationObject';
import ga from 'ga';
import globalStyle from '../../globalStyle';
import internationalize from 'tools/internationalize';
import pageLinks from 'pageLinks';
import pricesPreView from 'tools/pricesPreView';
import sendMessage from 'tools/sendMessage';
import store from 'store';
import { html, LitElement } from 'lit';
import { connect } from 'pwa-helpers/connect-mixin';
import { experimentsHelper } from 'experiments';


const translations: { [ key: string ]: string } = createTranslation({
  'getTurboSpeed': 'get_turbo_speed',
  'moneyBackGuarantee': '7_days_money_back_guarantee',
  'upgradeConnectionSpeed': 'upgrade_connection_speed'
});


class UpgradeSpeedBanner extends connect( store as any )( LitElement ) {
  premiumLink: string; // @ts-ignore
  priceString: string;

  render() {
    // Keep english
    const fromOnlyPricePerMonth = internationalize( 'from_only_X_per_month' )
      .replace( /XXX/g, this.priceString );

    return html`
    <style>
    ${globalStyle}
    :host{
      display: block;
      position: relative;
      background: #c0392b;
      margin: 6px 6px 0 6px;
      border-radius: 4px;
      height: 82px;
      color: #fff;
      text-align: center;
      line-height: 1;
    }
    :host > .In{
      display: table;
      height: 100%;
      width: 100%;
    }
    :host > .In > .In{
      display: table-cell;
      vertical-align: middle;
      padding: 0 7px;
    }
    .Title{
      text-transform: uppercase;
      font-size: 23px;
      font-weight: bold;
    }
    .Price{
      color: #f1c40f;
      font-size: 18px;
      font-weight: bold;
      padding: 3px 0 7px;
    }
    .Days{
      color: #e1afab;
      font-size: 12px;
    }
    .Link{
      display: block;
      position: absolute;
      top:0px;
      right:0px;
      bottom:0px;
      left:0px;
      white-space: nowrap;
      overflow: hidden;
      text-indent: -9999px;
      font-size: 0;
    }
    </style>

    <div class="In"><div class="In">
      <div class="Title">${translations.upgradeConnectionSpeed}</div>
      <div class="Price">${fromOnlyPricePerMonth}</div>
      <div class="Days">${translations.moneyBackGuarantee}</div>
    </div></div>
    <a class="Link" @click=${this.linkClick} href="${this.premiumLink}" target="_blank">
      ${translations.getTurboSpeed}
    </a>`;
  }

  static get properties() {
    return {
      'premiumLink': {
        'type': String
      },
      'priceString': {
        'type': String
      }
    };
  }

  constructor() {
    super();

    this.premiumLink = '';
    this.priceString = '';

    ( async() => {
      const storeState = await store.getStateAsync();

      const clientId: string = await ga.full.userIdPromise;
      const expvarid = await experimentsHelper.getEngagedEnabledExpvarid();
      const urlObject = new URL( pageLinks.premium + '&cid=' + clientId );

      const urlParams: { [ key: string ]: string } = {
        'utm_source': 'chromium extension',
        'utm_medium': 'banner',
        'utm_campaign': 'default_campaign'
      };

      this.premiumLink = browsecLink({
        'action': ( search: { [ key: string ]: string | number | boolean }) => {
          return Object.assign( search, urlParams );
        },
        storeState,
        'url': urlObject.toString(),
        expvarid
      });
    })();
  }

  /** @method */
  stateChanged({ prices, priceTrial }: StoreState ): void {
    const { priceString } = pricesPreView({ 'language': 'en', prices, priceTrial });
    this.priceString = priceString;
  }

  // Methods
  /** @method */
  async linkClick() {
    sendMessage({ 'type': 'upgrade speed banner: click' });

    await new Promise( resolve => { setTimeout( resolve, 50 ); });

    self?.close?.();
  }
};
customElements.define( 'upgrade-speed-banner', UpgradeSpeedBanner );


export default UpgradeSpeedBanner;
