import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import createTranslation from 'popup/tools/createTranslationObject';
import IndexHome from 'popup/components/index/home';

const translations: { [key: string]: string } = createTranslation({
  'connectionsNotEncrypted': 'your_browsers_connections_are_not_encrypted',
  'protectionDisabled': 'privacy_protection_disabled',
  'startVpn': 'start_vpn',
});

type homeStatusInactiveProps = Pick<IndexHome, 'enableProxy' | 'language'>;

export function homeStatusInactive({ enableProxy, language }: homeStatusInactiveProps ) {
  return html`
    <style>
      .Inactive {
        flex: 1;
        padding-top: 16px;
        position: relative;
      }

      .Inactive_Top {
        height: 188px;
        display: flex;
        align-items: center;
      }

      :host(.withPromo) .Inactive_Top {
        height: 147px;
      }

      .Inactive_Top > * {
        flex-grow: 1;
      }

      .Inactive {
        text-align: center;
        white-space: normal;
      }

      :host(.withPromo) .Inactive {
        vertical-align: top;
      }

      .Inactive_Icon {
        display: block;
        background: url('/images/global_protection_disabled.svg') 50% 0 no-repeat;
        background-size: auto 100%;
        width: 100%;
        overflow: hidden;
        font-size: 0;
        text-indent: -9999px;
        height: 0;
        padding-top: 114px;
      }

      :host(.withPromo) .Inactive_Icon {
        padding-top: 76px;
      }

      .Inactive_Text {
        font-size: 14px;
        padding: 4px ${language === 'en' ? '28' : '20'}px 0;
        line-height: 17px;
      }

      .Inactive_Title {
        font-size: 18px;
        font-weight: 600;
        padding-top: 10px;
        color: var(--brand-burgundy);
      }

      :host(.withPromo) .Inactive_Title {
        padding-top: 0;
      }

      .Inactive_ButtonOut {
        display: flex;
        justify-content: center;
        padding-top: 24px;
      }

      :host(.withPromo) .Inactive_ButtonOut {
        padding-top: 10px;
      }

      .Inactive_Button {
        flex-grow: 0;
        flex-shrink: 0;
        cursor: pointer;
        text-decoration: none;
        color: #fff;
        min-width: 208px;
        height: 45px;
        line-height: 42px;
        border-radius: 4px;
        background: var(--brand-green);
        font-size: 17px;
        text-align: center;
        padding: 0 10px;
      }
    </style>
    <div class="Inactive">
      <div class="Inactive_Top">
        <div class="Inactive_Top_Static">
          <div class="Inactive_Icon"></div>
          <div class="Inactive_Title">${translations.protectionDisabled}</div>
          <div class="Inactive_Text">${unsafeHTML( translations.connectionsNotEncrypted )}</div>
        </div>
      </div>
      <div class="Inactive_ButtonOut">
        <div class="Inactive_Button" @click="${enableProxy}">
          ${translations.startVpn}
        </div>
      </div>
    </div>
  `;
}
