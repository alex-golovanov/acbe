import { LitElement, html } from 'lit';

import jitsu from 'jitsu';
import { popupCloseIcon } from 'images';
import createTranslation from 'popup/tools/createTranslationObject';
import globalStyle from '../globalStyle';


const translations: { [ key: string ]: string } = createTranslation({
  'okIGotIt': 'ok_i_got_it',
  'smartSettingsControl': 'smart_settings_allow_you_to_control',
  'smartSettingsFeatures1': 'smart_settings_features_1',
  'smartSettingsFeatures2': 'smart_settings_features_2',
  'smartSettingsFeatures3': 'smart_settings_features_3',
  'withSmartSettingsYouCan': 'with_smart_settings_you_can'
});


class PopupHelp extends LitElement {
  render() {
    return html`
    <style>
    ${globalStyle}
    :host{
      display: block;
      font-size: 14px;
      line-height: 1.3;
      color: var( --brand-blue );
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 4;
    }
    :host > .Overlay{
      position: absolute;
      top:0px;right:0px;bottom:0px;left:0px;
      overflow: hidden;
      text-indent: -9999px;
      font-size: 0;
    }
    :host > .In{
      position: absolute;
      top:56px;
      right:0px;
      bottom:40px;
      left:0px;
      border: 1px solid transparent;
      border-width: 6px 5px 5px;
    }
    :host > .In > .Bg{
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: #fff;
      box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      font-size: 0;
      overflow: hidden;
    }
    :host > .In > .In{
      position: relative;
      padding: 27px 20px;
    }

    .Title{
      font-size: 18px;
      padding-bottom: 15px;
      font-weight: 600;
    }
    .Description{
      padding-bottom: 20px;
    }
    ul{
      list-style: none;
    }
    ul > li{
      padding-left: 20px;
      position: relative;
    }
    ul > li::after{
      content: '';
      display: block;
      background: url('/images/popup-help/check.svg') 0 0 no-repeat;
      background-size: 100% 100%;
      width: 14px;
      overflow:hidden;font-size:0;text-indent:-9999px;height:0;
      padding-top:10px;
      position: absolute;
      top: 5px;
      left: 0;
    }
    ul > li + li{
      border-top: 7px solid transparent;
    }
    .Button{
      text-align: center;
      padding-top: 15px;
    }
    .Button input{
      display: block;
      margin: 0 auto;
      box-sizing: content-box;
      height: 45px;
      line-height: 45px;
      border: 0;
      cursor: pointer;
      min-width: 200px;
      padding: 0 15px;
      background: var( --brand-green );
      text-align: center;
      border-radius: 5px;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
    }

    .Close{
      position: absolute;
      top: 16px;
      right: 16px;
      cursor: pointer;
    }
    .Close:hover svg path {
      fill: var( --brand-blue );
    }
    </style>

    <div class="Overlay">&nbsp;</div>
    <div class="In">
      <div class="Bg"></div>
      <div class="In">
        <div class="Title">${translations.smartSettingsControl}</div>
        <div class="Description">${translations.withSmartSettingsYouCan}</div>
        <div class="Features">
          <ul>
            <li>${translations.smartSettingsFeatures1}</li>
            <li>${translations.smartSettingsFeatures2}</li>
            <li>${translations.smartSettingsFeatures3}</li>
          </ul>
        </div>
        <div class="Button">
          <input 
            type="button" 
            value="${translations.okIGotIt}" 
            @click="${this.okClick}"
          />
        </div>
        <div class="Close" @click="${this.close}">${popupCloseIcon}</div>
      </div>
    </div>`;
  }

  // Methods
  /** @method */
  close( event: Event ) {
    event.stopPropagation();

    jitsu.track( 'smartSettings_intro_close' );

    this.closePopup();
  }

  /** @method */
  async closePopup() {
    const animation = this.animate(
      [
        { 'opacity': 1 },
        { 'opacity': 0 }
      ],
      { 'duration': 400, 'easing': 'linear' }
    );
    await new Promise( resolve => { animation.onfinish = resolve; });
    
    this.style.cssText = 'display:none';
  }

  /** @method */
  okClick( event: Event ) {
    event.stopPropagation();

    jitsu.track( 'smartSettings_intro_ok' );

    this.closePopup();
  }
};
customElements.define( 'popup-help', PopupHelp );
