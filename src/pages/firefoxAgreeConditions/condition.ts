import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import '../../popup/components/checkbox-switch';

/**
 * @element `firefox-condition` - A condition component used to display firefox term and condition.
 *
 * @property {function} onSwitch - A callback function that will be called when the switcher is clicked.
 * @property {function} onActionClick - A callback function that will be called when the action text is clicked.
 * @property {string} value - The value of the swith component.
 * @property {string} label - The title of condition.
 * @property {string} text - The main text of condition.
 * @property {string} actionText - The clickable part of text.
 */
@customElement('firefox-condition')
export class Condition extends LitElement {
  @property({ attribute: false })
    onSwitch: () => void = () => {};

  @property({ attribute: false })
    onActionClick: () => void = () => {};

  isOn: boolean = false;
  label: string = '';
  text: string = '';
  actionText: string = '';

  static get properties() {
    return {
      isOn: {
        type: Boolean,
      },
      label: {
        type: String,
      },
      text: {
        type: String,
      },
      actionText: {
        type: String,
      },
    };
  }

  render() {
    return html`
      <div>
        <div class="Sub_header">${this.label}</div>
        <div class="FF_switch_row">
          <div class="Text">
            ${this.text}<span class="FF_Link" @click="${this.onActionClick}"
              >${unsafeHTML(this.actionText)}</span
            >
          </div>
          <div>
            <checkbox-switch .checked="${this.isOn}" @click="${this.onSwitch}">
            </checkbox-switch>
          </div>
        </div>
      </div>
    `;
  }

  static styles = css`
    .Text {
      font-family: Open Sans;
      letter-spacing: -0.41px;
      color: #616675;
      margin-bottom: 0px;
      color: #616675;
      font-size: 12px;
      font-weight: 400;
      line-height: 17px;
      word-wrap: break-word;
      text-align: left;
    }
    .Text a {
      color: #007aff;
      text-decoration: none;
    }
    .Link {
      font-size: 16px;
      line-height: 1.4;
      letter-spacing: -0.41px;
      font-weight: 400;
      text-align: center;
      margin-bottom: 0px;
      color: #007aff;
      text-decoration: none;
      cursor: pointer;
    }

    .Sub_header {
      color: #616675;
      font-size: 15px;
      font-family: Open Sans;
      font-weight: 600;
      line-height: 17px;
      word-wrap: break-word;
      text-align: left;
      margin: 12px 0;
    }

    .FF_Link {
      font-weight: 400;
      text-align: center;
      color: #007aff;
      text-decoration: none;
      cursor: pointer;
    }

    .FF_switch_row {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 15px;
    }
  `;
}
