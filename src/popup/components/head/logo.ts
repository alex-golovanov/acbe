import { LitElement, html } from 'lit';
import globalStyle from '../globalStyle';


class HeadLogo extends LitElement {
  premium: boolean;

  render() {
    return html`
    <style>
    ${globalStyle}
    :host{
      display: block;
      padding: 5px 5px 0 5px;
      float: left;
    }

    :host > .In{
      display: table;
    }
    :host > .In > .L{
      display: table-cell;
      vertical-align: middle;
    }
    :host > .In > .R{
      display: table-cell;
      vertical-align: middle;
      padding-left: 10px;
    }

    .Ball{
      background: url( '/images/logo_ball.svg' ) 0 0 no-repeat;
      background-size: 100% 100%;
      width: 46px;
      padding-top: 46px;
      height: 0;
      overflow: hidden;
    }

    .Premium,
    .NoPremium{
      height: 0;
      overflow: hidden;
    }
    .Premium{
      background: url( '/images/logo_text_premium.svg' ) 0 0 no-repeat;
      background-size: 100% 100%;
      width: 85px;
      padding-top: 29px;
    }
    .NoPremium{
      background: url( '/images/logo_text.svg' ) 0 0 no-repeat;
      background-size: 100% 100%;
      width: 85px;
      padding-top: 14px;
    }

    img{
      display: block;
    }
    </style>

    <div class="In">
      <div class="L"><div class="Ball"></div></div>
      <div class="R">
        <div class="${this.premium ? 'Premium' : 'NoPremium'}"></div>
      </div>
    </div>`;
  }
  static get properties() {
    return {
      'premium': {
        'type': Boolean
      }
    };
  }

  constructor() {
    super();

    this.premium = false;
  }
}
customElements.define( 'head-logo', HeadLogo );
