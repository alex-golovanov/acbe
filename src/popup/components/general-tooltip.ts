import globalStyle from './globalStyle';
import { LitElement, html } from 'lit';


class GeneralTooltip extends LitElement {
  text: string;

  render() {
    return html`
    <style>
    ${globalStyle}
    :host{
      display: block;
      position: absolute;
    }
    :host > .Bg{
      position: absolute;
      top: 0px;
      right: 0px;
      bottom: 0px;
      left: 0px;
    }
    :host > .Bg::after{
      content: '';
      display: block;
      position: absolute;
      top:0px;left:0px;
      width: 100%;
      height: 100%;
      background: var( --brand-blue );
      border-radius: 4px;
      overflow: hidden;
      text-indent: -9999px;
    }
    :host > .Bg > .Corner{
      position: absolute;
      left: 16px;
      bottom: 100%;
      width: 10px;
      height: 5px;
      overflow: hidden;
    }
    :host > .Bg > .Corner::after{
      content: '';
      display: block;
      border: 5px solid transparent;
      border-bottom-color: var( --brand-blue );
      width: 0;
      height: 0;
      overflow: hidden;
      margin-top: -5px;
    }
    :host > .In{
      position: relative;
      padding: 5px 14px;
      color: #fff;
      font-size: 12px;
    }
    </style>

    <div class="Bg"><div class="Corner"></div></div>
    <div class="In">${this.text}</div>`;
  }
  static get properties() {
    return {
      'text': {
        'type': String
      }
    };
  }

  constructor() {
    super();

    this.text = '';
  }
};
customElements.define( 'general-tooltip', GeneralTooltip );
