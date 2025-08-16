import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import jitsu from 'jitsu';
import store from 'store';
import pageLinks from 'pageLinks';
import { browsecLink } from 'general/tools';
import { exclamationPointIcon } from 'images';
import createTranslation from 'popup/tools/createTranslationObject';
import { ANTIVIRUS } from 'constants/common';
import { REMOVE_WARNING_ACTION } from 'general/store/actions';
import { POPUP_PROXY_BLOCKED_BY_ANTIVIRUS } from '../../constants';

import 'popup/components/modal';

const RU_HOW_FIX_LINK = 'https://t.me/BrowsecVPNru/53';
const EN_HOW_FIX_LINK = 'https://t.me/BrowsecVPNofficial/34';
const SUPPORT_BROWSEC_EMAIL = 'support@browsec.com';

let translations: { [key: string]: string } = createTranslation({
  vpnBlocked: 'vpn_blocked',
  yourProxyBlockedByAntivirus: 'your_proxy_blocked_by_antivirus',
  findOutHowFix: 'find_out_how_fix',
  ifNoWriteToEmail: 'if_no_write_to_email',
});

/**
 * @element `popup-proxy-blocked-by-antivirus` - A modal component that displays a message
 * when a user's proxy is blocked by an antivirus.
 *
 */
@customElement(POPUP_PROXY_BLOCKED_BY_ANTIVIRUS)
export class PopupProxyBlockedByAntivirus extends LitElement {
  contactUsUrl = browsecLink({
    storeState: store.getStateSync(),
    url: pageLinks.contactUs,
  });

  sendFixClickMetric() {
    jitsu.track('warning_click', { reason: 'antivirus-block' });
  }
  sendEmailClickMetric() {
    jitsu.track('warning_email', { reason: 'antivirus-block' });
  }

  render() {
    const language = window.language as string;

    const onClose = () => {
      jitsu.track('warning_closed', { reason: 'antivirus-block' });
      store.dispatch({
        type: REMOVE_WARNING_ACTION,
        data: ANTIVIRUS,
      });
    };

    return html` <modal-container
      name=${POPUP_PROXY_BLOCKED_BY_ANTIVIRUS}
      .onClose=${onClose}
    >
      <div class="title">
        ${exclamationPointIcon} ${translations.vpnBlocked}
      </div>
      <div class="description">
        ${translations.yourProxyBlockedByAntivirus}
        <a
          href="${language === 'ru' ? RU_HOW_FIX_LINK : EN_HOW_FIX_LINK}"
          target="_blank"
          @click="${this.sendFixClickMetric}"
        >
          ${translations.findOutHowFix}
        </a>
      </div>
      <div>
        ${translations.ifNoWriteToEmail}
        <a
          href="${this.contactUsUrl}"
          target="_blank"
          @click="${this.sendEmailClickMetric}"
        >
          ${SUPPORT_BROWSEC_EMAIL}
        </a>
      </div>
    </modal-container>`;
  }

  static styles = css`
    :host .title {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 20px;
      font-weight: 700;
      color: var(--brand-blue);
    }

    :host .description {
      font-size: 18px;
    }

    :host .description > a {
      font-weight: 700;
    }

    :host a {
      color: var(--brand-blue);
      display: block;
      text-decoration: underline;
    }
  `;
}
