import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import jitsu from 'jitsu';
import ga from 'ga';

import createElement from 'tools/createElement';
import { globalStyle } from 'popup/components/globalStyle';

/**
 * @element `downloadable-promo` - A container component used to display, gotten from sever, banner content.
 *
 * @property {Boolean} hasRenderedDom - Indicates whether the DOM has been rendered from the JSON structure.
 * @property {Object} jsonStructure - The structure of the banner content as JSON, used to generate the DOM.
 * @property {string} bannerLink - The URL that the banner links to.
 * @property {string} promotionId - A unique identifier for the promotion, used for tracking analytics.
 */
@customElement('downloadable-promo')
export class DownloadablePromo extends LitElement {
  @property({ type: Boolean })
    hasRenderedDom = false;
  @property({ type: Object })
    jsonStructure: any = null;
  @property({ type: String })
    bannerLink = '';
  @property({ type: String })
    promotionId = '';

  handleLinkClick() {
    if (this.promotionId) {
      jitsu.track('banner_click', { campaign: this.promotionId });
      ga.partial({
        category: 'banner',
        action: 'click',
        label: 'banner_promo_' + this.promotionId,
      });
    }
  }

  renderDomFromJson({
    jsonStructure,
    link,
    promotionId,
  }: {
    jsonStructure: any;
    link: string;
    promotionId: string;
  }) {
    this.jsonStructure = jsonStructure;
    this.bannerLink = link;
    this.promotionId = promotionId;
    this.hasRenderedDom = true;
  }

  render() {
    return html`
      ${this.hasRenderedDom
        ? html`
            ${createElement(this.jsonStructure)}
            <a
              href=${this.bannerLink}
              target="_blank"
              @click=${this.handleLinkClick}
            ></a>
          `
        : html``}
    `;
  }

  static styles = css`
    ${globalStyle}
    :host {
      display: block;
      height: 82px;
      overflow: hidden;
      margin: 4px 4px 0;
      position: relative;
    }
    a {
      display: block;
      position: absolute;
      top: 0px;
      right: 0px;
      bottom: 0px;
      left: 0px;
      overflow: hidden;
      text-indent: -9999px;
      z-index: 3;
    }
  `;
}
