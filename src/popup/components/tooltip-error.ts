import { LitElement, html } from 'lit';
import globalStyle from './globalStyle';


class TooltipError extends LitElement {
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
      top:0px;
      right:0px;
      bottom:0px;
      left:0px;
      background: #faf5f5;
      border-radius: 4px;
      border: 1px solid #8e3c33;
      font-size: 0;
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
    }
    :host > .Bg::before,
    :host > .Bg::after{
      content: '';
      display: block;
      position: absolute;
      left: 16px;
      width: 0;
      height: 0;
      overflow: hidden;
      border: 5px solid transparent;
    }
    :host > .Bg:before{
      top: -10px;
      border-bottom-color: #8e3c33;
    }
    :host > .Bg:after{
      top: -9px;
      border-bottom-color: #faf5f5;
    }
    :host > .In{
      position: relative;
      color: var( --brand-burgundy );
      font-size: 12px;
      padding: 4px 11px;
      line-height: 19px;
      min-height: 19px; /* NOTE border in .Bg */
      min-width: 12px;
    }
    </style>

    <div class="Bg"></div>
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
}
customElements.define( 'tooltip-error', TooltipError );


export default TooltipError;
