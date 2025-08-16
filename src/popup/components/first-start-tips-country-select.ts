import globalStyle from './globalStyle';
import { LitElement, html } from 'lit';


class FirstStartTipsCountrySelect extends LitElement {
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
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
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
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      color: #fff;
      margin-bottom: 0px;
    }
    .Arrow{
      background: url( '/images/tip_arrow.svg' ) 0 0 no-repeat;
      width: 50px;
      padding-top: 100px;
      height: 0;
      overflow: hidden;
      text-indent: -9999px;
      font-size: 0;
      margin-left: auto;
    }

    .Close{
      width: 16px;
      height: 16px;
      position: absolute;
      cursor: pointer;
      font-size: 0;
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
      <div class="Text">
        To get the best speeds possible, you<br/>
        should change to a location closest to<br/>
        you geographically
      </div>
      <div class="Arrow"></div>
    </div></div>
    <div class="Close" @click="${this.close}"></div>`;
  }

  /** @method */
  close() {
    this.dispatchEvent( new CustomEvent( 'close' ) );
  }
};
customElements.define( 'first-start-tips-country-select', FirstStartTipsCountrySelect );
