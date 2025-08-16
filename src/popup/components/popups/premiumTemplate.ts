import createTranslation from '../../tools/createTranslationObject';
import globalStyle from '../globalStyle';
import internationalize from 'tools/internationalize';
import PopupPremium from './premium';
import { html } from 'lit';
import 'popup/components/updateStatus';


const translations: { [ key: string ]: string } = createTranslation({
  'accessInternet': 'access_internet_via_premium_locations',
  'cancelSubscriptionAtAnyTime': 'cancel_subscription_at_any_time',
  'dedicatedLanes': 'dedicated_traffic_lanes',
  'forOnly': 'for_only',
  'moneyBackGuarantee': '7_days_money_back_guarantee',
  'premiumLocations': 'premium_locations',
  'premiumServers': 'premium_servers',
  'performanceGuaranteed': 'top_performance_guaranteed',
  'turboSpeed': 'turbo_speed'
});


/** @method */
export default function( this: PopupPremium ) {
  // @ts-ignore
  const language = window.language as string;

  const onlyPricePerMonth: string = ( () => {
    const base = internationalize( 'only_X_per_month' );

    return base.replace( /XXX/g, this.priceString );
  })();


  return html`
  <style>
  ${globalStyle}
  :host{
    display: block;
    position: absolute;
    z-index: 3;
    top:0px;
    right:0px;
    left:0px;
    height: 100%;
    background: #fff;
  }

  .Head{
    background: var( --brand-blue );
    color: #fff;
    text-align: center;
    font-size: 17px;
    line-height: 36px;
    font-weight: 500;
    position: relative;
    padding: 9px 10px 9px;
    height: auto;
    overflow: visible;
  }

  .Close{
    position: absolute;
    top: 50%;
    right: 0;
    margin-top: -16px;
    width: 10px;
    padding-top: 10px;
    border: 11px solid transparent;
    height: 0;
    overflow: hidden;
    background: url( '/images/popup_close_2.svg#grey' ) 0 0 no-repeat;
    background-size: 100% 100%;
    cursor: pointer;
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

  .Features{
    padding: 10px 10px 15px 10px;
    color: #7a7c7f;
  }
  .Features > .E{
    min-height: 80px;
    box-sizing: border-box;
    padding: 2px 0 0px 90px;
    position: relative;
    width: 350px;
  }
  :host(.withPrice) .Features > .E{
    min-height: 70px;
  }
  .Features > .E::before{
    content: "";
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    width: 65px;
    padding-top:65px;
    position: absolute;
    left: 4px;
    top: 8px;
    background-position: 0 0;
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
  .Features > .E.countries::before{
    background-image: url( '/images/promos/circles.svg#countries' );
  }
  .Features > .E.speed::before{
    background-image: url( '/images/promos/circles.svg#speed' );
  }
  .Features > .E.servers::before{
    background-image: url( '/images/promos/circles.svg#servers' );
  }

  .Feature_Name{
    color: #28334e;
    font-size: 17px;
    margin: 9px 0 2px;
    line-height: 1.29;
  }
  .Feature_Text{
    font-size: ${language === 'en' ? '15px' : '13px'};
    line-height: 1.25;
  }

  .BottomPart{
    position: absolute;
    bottom: 5px;
    left: 5px;
    right: 5px;
  }
  .Button{
    display: table;
    width: 100%;
    height: 45px;
    background: var( --brand-green );
    text-align: center;
    border-radius: 4px;
    position: relative;
  }
  :host(.withPrice) .Button{
    height: 60px;
  }
  .Button:link,
  .Button:visited,
  .Button:hover,
  .Button:active{
    color: #fff;
    text-decoration: none;
  }
  .Button *{
    cursor: pointer;
  }
  .Button > .In{
    display: table-cell;
    vertical-align: middle;
  }

  .Button_Name{
    display: block;
    font-size: 17px;
  }
  .Button_Name.uppercase{
    text-transform: uppercase;
  }
  :host(.withPrice) .Button_Name{
    font-weight: 600;
    font-size: 18px;
    text-transform: uppercase;
  }
  .Button_Price{
    display: block;
    font-size: 14px;
  }
  .Button_Price_Value{
    font-size: 14px;
    font-weight: bold;
  }
  .Button_Price_OldValue{
    font-size: 12px;
    text-decoration: line-through;
    color: #9aca9f;
    margin-left: 3px;
  }

  .Button_Discount{
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 25px;
  }
  .Button_Discount > .In{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54px;
    height: 54px;
    background: url( '/images/discount.svg' ) 0 0 no-repeat;
    position: absolute;
    right: 0;
    top: calc(50% - 54px / 2);
  }
  .Button_Discount_Minus{
    flex-grow: 0;
    flex-shrink: 0;
    font-size: 16px;
    font-weight: bold;
  }
  .Button_Discount_Value{
    flex-grow: 0;
    flex-shrink: 0;
    font-size: 23px;
    font-weight: bold;
  }
  .Button_Discount_Percent{
    flex-grow: 0;
    flex-shrink: 0;
    font-size: 12px;
    font-weight: bold;
  }

  .ExtraText{
    color: #808080;
    font-size: 12px;
    text-align: center;
    padding: 7px 0 5px;
  }
  </style>

  <div class="Head">
    Browsec Premium
    <div class="Close" @click="${this.close}"></div>
  </div>
  <div class="Features">
    <div class="E countries">
      <div class="Feature_Name">${translations.premiumLocations}</div>
      <div class="Feature_Text">${translations.accessInternet}</div>
    </div>
    <div class="E speed">
      <div class="Feature_Name">${translations.turboSpeed}</div>
      <div class="Feature_Text">${translations.dedicatedLanes}</div>
    </div>
    <div class="E servers">
      <div class="Feature_Name">${translations.premiumServers}</div>
      <div class="Feature_Text">${translations.performanceGuaranteed}</div>
    </div>
  </div>
  <div class="BottomPart">
  ${( () => {
      if( !this.withPrice ) return '';

      const translation: string = ( () => {
        if( this.trialDays ) {
          return translations.cancelSubscriptionAtAnyTime;
        }

        return translations.moneyBackGuarantee;
      })();

      return html`
    <div class="ExtraText">${translation}</div>`;
    })()}
    <a href="${this.premiumLink}" class="Button" @click="${this.linkClick}" target="_blank">
      <span class="In">
        <span class="Button_Name ${this.trialDays && !this.withPrice ? 'uppercase' : ''}">
          ${this.buttonText}
        </span>
  ${( () => {
    if( !this.withPrice || this.trialDays ) return '';

    return html`
        <span class="Button_Price">
        ${( () => {
          if( !this.discount ) return onlyPricePerMonth;

          return html`
          ${translations.forOnly}
          <span class="Button_Price_Value">${this.priceString}</span>
          <span class="Button_Price_OldValue">${this.oldPriceString}</span>`;
        })()}
        </span>`;
  })()}
      </span>
  ${( () => {
    if( !this.withPrice || !this.discount ) return '';
    return html`
      <span class="Button_Discount"><span class="In">
        <span class="Button_Discount_Minus">-</span>
        <span class="Button_Discount_Value">${this.discount}</span>
        <span class="Button_Discount_Percent">%</span>
      </span></span>`;
  })()}
    </a>
    <update-status .closePopup=${this.close.bind(this)} />
  </div>`;
};
