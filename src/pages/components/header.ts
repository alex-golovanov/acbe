/* global StoreAccount, StoreGuestAccount, StoreState */
import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import 'popup/components/head/logo';

/**
 * @element `tab-header` - Header for all pages in tabsи.
 **/
@customElement('tab-header')
export class TabHeader extends LitElement {
  render() {
    return html` <head-logo></head-logo>
      <div class="In"></div>`;
  }

  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      height: 56px;
      line-height: 56px;
      border: 1px solid var(--brand-site-blue);
      border-width: 0 5px 0 5px;
      background: var(--brand-site-blue);
      color: #fff;
      overflow: hidden;
      position: relative;
      padding: 12px !important;
    }

    :host::after {
      content: ' ';
      clear: both;
      display: block;
      width: 0;
      height: 0;
      overflow: hidden;
      font-size: 0;
    }

    :host > .In {
      overflow: hidden;
      height: 100%;
      max-width: 717px;
      text-align: right;
    }
  `;
}
