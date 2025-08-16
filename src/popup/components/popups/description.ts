import { LitElement, html } from 'lit';

import { popupCloseIcon } from 'images';
import createTranslation from 'popup/tools/createTranslationObject';
import globalStyle from '../globalStyle';


const translations: { [ key: string ]: { [ key: string ]: string } } =
  createTranslation({
    'changeTimezone': {
      'p1': 'change_timezone_text_1',
      'p2': 'change_timezone_text_2',
      'p3': 'change_timezone_text_3'
    },
    'whatIsWebrtc': {
      'title': 'what_is_webrtc_title',
      'p1': 'what_is_webrtc_text_1',
      'p2': 'what_is_webrtc_text_2',
      'p3': 'what_is_webrtc_text_3'
    }
  });


class PopupDescription extends LitElement {
  theme: string;

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
      width: 100%;
      height: 100%;
    }
    :host > .In > .In > .In{
      position: absolute;
      left: 20px;
      right: 20px;
      top: 25px;
      bottom: 20px;
      overflow: auto;
    }
    :host > .In > .In > .In::-webkit-scrollbar{
      width: 6px;
    }
    :host > .In > .In > .In::-webkit-scrollbar-track{
      border-radius: 3px;
      background: rgba(255,255,255,0);
    }
    :host > .In > .In > .In::-webkit-scrollbar-thumb{
      border-radius: 3px;
      background: #aaa;
    }

    .Text{
      color: var( --brand-blue );
      font-size: 14px;
      line-height: 1.375;
    }
    .Title{
      font-size: 18px;
      font-weight: 600;
      padding-bottom: 15px;
    }
    .Text p + p{
      padding-top: 1em;
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

    <div class="Overlay" @click="${this.close}">&nbsp;</div>
    <div class="In">
      <div class="Bg"></div>
      <div class="In">
        <div class="In Text">
  ${( () => {
    if( this.theme === 'date' ) {
      return html`
          <p>${translations.changeTimezone.p1}</p>
          <p>${translations.changeTimezone.p2}</p>
          <p>${translations.changeTimezone.p3}</p>`;
    }
    if( this.theme === 'webrtc' ) {
      return html`
          <div class="Title">${translations.whatIsWebrtc.title}</div>
          <p>${translations.whatIsWebrtc.p1}</p>
          <p>${translations.whatIsWebrtc.p2}</p>
          <p>${translations.whatIsWebrtc.p3}</p>`;
    }
    return '';
  })()}
        </div>
        <div class="Close" @click="${this.close}">${popupCloseIcon}</div>
      </div>
    </div>
    `;
  }
  static get properties() {
    return {
      'theme': {
        'type': String
      }
    };
  }

  constructor() {
    super();

    this.theme = '';
  }

  // Methods
  async close() {
    const animation = this.animate(
      [
        { 'opacity': 1 },
        { 'opacity': 0 }
      ],
      { 'duration': 400, 'easing': 'linear' }
    );
    await new Promise( resolve => { animation.onfinish = resolve; });
    

    this.remove();
  }
};
customElements.define( 'popup-description', PopupDescription );
