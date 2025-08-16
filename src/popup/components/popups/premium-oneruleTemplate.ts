import createTranslation from '../../tools/createTranslationObject';
import globalStyle from '../globalStyle';
import internationalize from 'tools/internationalize';
import PopupPremiumOnerule from './premium-onerule';
import { html } from 'lit';


let translations: { [ key: string ]: string } = createTranslation({
  'browsecPremium': 'browsec_premium',
  'cancelSubscriptionAtAnyTime': 'cancel_subscription_at_any_time',
  'forOnly': 'for_only',
  'moneyBackGuarantee': '7_days_money_back_guarantee',
  'oneSmartSettingDescription1': 'one_smart_setting_description_1',
  'oneSmartSettingDescription2': 'one_smart_setting_description_2',
  'oneSmartSettingDescriptionList1': 'one_smart_setting_description_list_1',
  'oneSmartSettingDescriptionList2': 'one_smart_setting_description_list_2',
  'youCanHaveOnlyOneSmartSetting': 'you_can_have_only_1_smart_setting'
});


/** @method */
export default function( this: PopupPremiumOnerule ) {
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
    top:0px;right:0px;left:0px;
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

  .Text{
    padding: 20px 25px;
    color: var( --brand-blue );
    line-height: 1.35;
  }
  .Title{
    font-size: 18px;
    font-weight: 600;
    padding-bottom: 15px;
  }
  .Description{
    font-size: 16px;
  }
  .Description p{
    padding-bottom: 15px;
  }
  .Description ul{
    list-style: none;
  }
  .Description ul > li{
    position: relative;
    padding-left: 20px;
  }
  .Description ul > li::after{
    content: '';
    background: url( '/images/popup-help/check.svg' ) 0 0 no-repeat;
    background-size: 100% 100%;
    width: 12px;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    padding-top: 9px;
    position: absolute;
    top: 50%;
    margin-top: -5px;
    left: 0;
  }

  .BottomPart{
    position: absolute;
    right:5px;
    bottom:5px;
    left:5px;
  }
  .Button{
    display: table;
    width: 100%;
    height: 60px;
    background: var( --brand-green );
    text-align: center;
    border-radius: 4px;
    position: relative;
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
    font-size: 16px;
    font-weight: 600;
  }
  .Button_Name.uppercase{
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
    ${translations.browsecPremium}
    <div class="Close" @click="${this.close}"></div>
  </div>
  <div class="Text">
    <div class="Title">${
      translations.youCanHaveOnlyOneSmartSetting
   }</div>
    <div class="Description">
      <p>${translations.oneSmartSettingDescription1}</p>
      <p>${translations.oneSmartSettingDescription2}</p>
      <ul>
        <li>${translations.oneSmartSettingDescriptionList1}</li>
        <li>${translations.oneSmartSettingDescriptionList2}</li>
      </ul>
    </div>
  </div>
  <div class="BottomPart">
    ${( () => {
       if( !this.withPrice ) return '';
  
       const translation = ( () => {
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
      </span></span></span>`;
      })()}
    </a>
    <update-status .closePopup=${this.close.bind(this)} />
  </div>`;
}
