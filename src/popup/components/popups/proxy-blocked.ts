import createTranslation from '../../tools/createTranslationObject';
import globalStyle from '../globalStyle';
import sendMessage from 'tools/sendMessage';
import { LitElement, html } from 'lit';


let translations: { [ key: string ]: string } = createTranslation({
  'cantStartBecauseYourProxySettingsBlocked':
    'cant_start_because_your_proxy_settings_blocked',
  'fixIt': 'fix_it'
});


class PopupProxyBlocked extends LitElement {
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
      z-index: 2;
    }
    :host > .Overlay{
      position: absolute;
      top:0px;right:0px;bottom:0px;left:0px;
      overflow: hidden;
      text-indent: -9999px;
      font-size: 0;
      background: rgba(255, 255, 255, 0.5);
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
      display: table;
      width: 100%;
      height: 100%;
    }
    :host > .In > .In > .In{
      display: table-cell;
      vertical-align: middle;
    }

    .Description{
      color: var( --brand-blue );
      font-size: 16px;
      line-height: 1.375;
      padding: 0 25px;
      text-align: center;
    }
    .Button{
      text-align: center;
      padding-top: 25px;
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
      background: #3b9946;
      text-align: center;
      border-radius: 5px;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
    }
    </style>

    <div class="Overlay">&nbsp;</div>
    <div class="In">
      <div class="Bg"></div>
      <div class="In"><div class="In">
        <div class="Description">
          ${translations.cantStartBecauseYourProxySettingsBlocked}
        </div>
        <div class="Button">
          <input type="button" value="${translations.fixIt}" @click="${this.fixIt}"/>
        </div>
      </div></div>
    </div>`;
  }

  // Methods
  /** @method */
  async fixIt() {
    await sendMessage({
      'type': 'create tab',
      'options': '/pages/unblock_proxy/unblock_proxy.html'
    });
    self.close();
  }
};
customElements.define( 'popup-proxy-blocked', PopupProxyBlocked );
