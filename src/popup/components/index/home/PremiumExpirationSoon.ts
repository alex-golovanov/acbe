import { browsecLink } from 'general/tools';
import createTranslation from '../../../tools/createTranslationObject';
import ga from 'ga';
import globalStyle from '../../globalStyle';
import pageLinks from 'pageLinks';
import store from 'store';
import { LitElement, html } from 'lit';
import { experimentsHelper } from 'experiments';


const translations: { [ key: string ]: string } = createTranslation({
  'continueUsing': 'continue_using_premium',
  'goAheadAndRenewIt': 'go_ahead_and_renew_it',
  'premiumIsAboutToExpire': 'your_premium_is_about_to_expire'
});


class PremiumExpirationSoon extends LitElement {
  expirationPremiumLink: string;

  render() {
    return html`
    <style>
    ${globalStyle}
    :host{
      display: block;
      margin: 1px 0 0;
      background: #fcd0cb;
      border-bottom: 1px solid var( --brand-burgundy );
      padding: 10px 10px 10px;
    }
    .Close{
      position: absolute;
      top: -5px;
      right: -1px;
      color: var( --brand-burgundy );
      cursor: pointer;
      width: 10px;
      padding-top: 10px;
      border: 11px solid transparent;
      height: 0;
      overflow: hidden;
      background: url( '/images/popup_close_2.svg#pink' ) 0 0 no-repeat;
      background-size: 100% 100%;
    }
    .Close:hover{
      background-image: url( '/images/popup_close_2.svg#white' );
    }
    .Close::after{
      content: '';
      display: block;
      position: absolute;
      width: 1px;
      height: 1px;
      top: 0;
      left: 0;
      background: url( '/images/popup_close_2.svg#white' ) 0 -5000px no-repeat;
    }

    .Title{
      color: var( --brand-burgundy );
      font-size: 14px;
      text-align: center;
    }
    .Description{
      color: #1c304e;
      font-size: 12px;
      text-align: center;
    }

    .Link_Out{
      display:flex;
      justify-content: center;
      text-align: center;
      font-size: 12px;
      padding-top: 5px;
    }
    .Link{
      flex-glow: 0;
      flex-shrink: 0;
      vertical-align:top;
      cursor:pointer;
    }
    .Link:link,
    .Link:visited{
      text-decoration: none;
      border-bottom:1px #1c304e solid;
      color: #1c304e;
    }
    .Link:hover{
      color: #fff;
      border-bottom:1px solid #fff;
    }
    </style>

    <div class="Close" @click="${this.expirationClose}"></div>
    <div class="Title">${translations.premiumIsAboutToExpire}</div>
    <div class="Description">${translations.goAheadAndRenewIt}</div>
    <div class="Link_Out">
      <a class="Link" href="${this.expirationPremiumLink}" target="_blank">
        ${translations.continueUsing}
      </a>
    </div>`;
  }

  static get properties() {
    return {
      'expirationPremiumLink': {
        'type': String
      },
    };
  }

  constructor() {
    super();

    this.expirationPremiumLink = '';

    ( async() => {
      const storeState = await store.getStateAsync();

      const urlParams: { [ key: string ]: string } = {
        'utm_source': 'chromium extension',
        'utm_campaign': 'default_campaign'
      };

      const clientId: string = await ga.full.userIdPromise;
      const expvarid = await experimentsHelper.getEngagedEnabledExpvarid();

      this.expirationPremiumLink = browsecLink({
        'action': ( search: { [ key: string ]: string | number | boolean }) => {
          return Object.assign( search, urlParams );
        },
        storeState,
        'url': pageLinks.base + '/en/orders/new?plan_id=annual&ref=extension&cid=' + clientId,
        expvarid
      });
    })();
  }

  /** @method */
  expirationClose() {
    this.dispatchEvent( new CustomEvent( 'expirationclose' ) );
  }
}
customElements.define( 'premium-expiration-soon', PremiumExpirationSoon );


export default PremiumExpirationSoon;
