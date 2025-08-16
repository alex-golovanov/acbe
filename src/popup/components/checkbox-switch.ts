/* global LitUpdatedChanges */
import { LitElement, html } from 'lit';
import globalStyle from './globalStyle';


class CheckboxSwitch extends LitElement { // @ts-ignore
  checked: boolean;

  render() {
    return html`
    <style>
    ${globalStyle}
    :host{
      display: block;
      width: 41px;
      height: 24px;
      cursor: pointer;
      position: relative;
    }
    :host::before{
      content: '';
      display: block;
      background: #e6e6e6;
      position: absolute;
      top: 3px;
      left: 0;
      right: 3px;
      overflow:hidden;font-size:0;text-indent:-9999px;height:0;
      padding-top:16px;
      border-radius: 8px;
      transition: background-color 0.15s ease-out 0s;
      box-shadow: inset 0 1px 2px rgba( 0, 0, 0, 0.2 );
    }
    :host(.checked)::before{
      background: var( --brand-green );
    }

    :host::after{
      content: '';
      display: block;
      width: 20px;
      overflow:hidden;font-size:0;text-indent:-9999px;height:0;
      padding-top:20px;
      background: #fff;
      border-radius: 50%;
      border: 1px solid #e8e8e8;
      box-shadow: 1px 1px 2px 0 rgba(0, 0, 0, 0.1);
      position: absolute;
      top: 0;
      left: 0;
      transition: left 0.15s ease-out 0s;
    }
    :host(.checked)::after{
      left: 17px;
    }
    </style>`;
  }
  static get properties() {
    return {
      'checked': {
        'type': Boolean
      }
    };
  }

  /** @method */
  // @ts-ignore
  updated( changes: LitUpdatedChanges<CheckboxSwitch> ) {
    if( changes.has( 'checked' ) ) {
      this.classList.toggle( 'checked', this.checked );
    }
  }
};
customElements.define( 'checkbox-switch', CheckboxSwitch );
