import globalStyle from './globalStyle';
import internationalize from 'tools/internationalize';
import { LitElement, html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';


const clickHereTranslation = internationalize( 'click_here_to_start_vpn' );


class FirstStartTipsStartVpn extends LitElement {
  bottom: number;

  constructor() {
    super();

    this.bottom = 0;
  }

  render() {
    return html`
    <style>
    ${globalStyle}
    :host{
      display:block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      font-size: 14px;
    }

    :host > .In{
      position: absolute;
      bottom: ${this.bottom}px;
      left: 0;
      right: 0;
      text-align: center;
    }
    :host > .In > .In{
      text-align: left;
      display: inline-block;
      vertical-align: top;
    }
    .Text{
      font-size: calc( 100% * 18 / 14 );
      font-weight: 600;
      text-align: center;
      color: #fff;
      margin-bottom: 0px;
    }
    .Arrow{
      background: url( '/images/tip_arrow.svg' ) 0 0 no-repeat;
      background-size: 100% 100%;
      width: calc( 1em * 50 / 14 );
      height: calc( 1em * 100 / 14 );
      overflow: hidden;
      text-indent: -9999px;
      margin-left: auto;
    }

    .Close{
      width: calc( 1em * 16 / 14 );
      height: calc( 1em * 16 / 14 );
      position: absolute;
      cursor: pointer;
      right: 20px;
      top: 20px;
      transform: rotate(45deg)
    }
    .Close::before,
    .Close::after{
      content: '';
      display: block;
      position: absolute;
      background: #fff;
      overflow: hidden;
    }
    .Close::before{
      top: 0;
      left: calc( 50% - 1px );
      height: 100%;
      width: 2px;
    }
    .Close::after{
      left: 0;
      top: calc( 50% - 1px );
      width: 100%;
      height: 2px;
    }
    .Close:hover::before,
    .Close:hover::after{
      background: #ddd;
    }
    </style>

    <div class="In"><div class="In">
      <div class="Text">${unsafeHTML( clickHereTranslation )}</div>
      <div class="Arrow"></div>
    </div></div>
    <div class="Close" @click="${this.close}"></div>`;
  }

  /** @method */
  close() {
    this.dispatchEvent( new CustomEvent( 'close' ) );
  }
};
customElements.define( 'first-start-tips-start-vpn', FirstStartTipsStartVpn );
