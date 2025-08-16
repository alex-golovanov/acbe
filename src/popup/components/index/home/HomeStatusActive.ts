import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import createTranslation from 'popup/tools/createTranslationObject';
import IndexHome from 'popup/components/index/home';

const translations: { [key: string]: string } = createTranslation({
  'privacyProtected': 'your_privacy_is_protected',
  'privacyPartiallyProtected': 'privacy_protection_partially_enabled',
  'privacyPartiallyDisabled': 'privacy_protection_partially_disabled',
});


export function homeStatusActive({
  switchesView,
  proxyEnabled,
  country,
  proxySwitch,
  domainProxySwitch,
  countryChange,
  domainCountryChange,
  openLocations, countryName
}: IndexHome ) {
  return html`
    <style>
      .Active {
        flex: 1;
        padding: 32px 8px;
        position: relative;
      }

      :host(.withPromo) .Active {
        margin-top: 16px;
      }
      
      .Active.Complex {
        padding: 32px 20px;
      }

      .Active_Top {
        height: 157px;
        display: flex;
        align-items: center;
        padding-bottom: 28px;
      }

      :host(.withPromo) .Active_Top {
        padding-bottom: 0;
      }

      .Active_Top > * {
        flex-grow: 1;
      }

      .Icon {
        content: ' ';
        display: block;
        background-size: auto 100%;
        overflow: hidden;
        font-size: 0;
        text-indent: -9999px;
        height: 0;
        padding-top: 112px;
      }

      .Icon.Active_Icon {
        background: url('/images/global_protection_enabled.svg') 50% 0 no-repeat;
      }

      .Icon.Inactive_Icon {
        background: url('/images/global_protection_disabled.svg') 50% 0 no-repeat;
      }
      .Text {
        font-size: 18px;
        line-height: 1;
        padding: 27px 28px 0;
        text-align: center;
      }

      .Text.Active_Text {
        color: var(--brand-green);
      }
      
      .Text.Inactive_Text {
        color: var(--brand-burgundy);
      }

      :host(.withPromo) .Active_Text {
        padding: 10px 10px 0;
      }

      .Active_Country_Out {
        padding: 14px 20px 0;
      }

      :host(.withPromo) .Active_Country_Out {
        padding: 4px 20px 0;
      }
    </style>
    <div class="Active ${switchesView.type !== 'simple' && 'Complex'}">
      <div class="Active_Top">
        <div class="Active_Top_Static">
          ${when( switchesView.type === 'simple' && proxyEnabled, () => html`
            <div class="Icon Active_Icon"></div>
            <div class="Text Active_Text">${translations.privacyProtected}</div>
          ` )}
          ${when( switchesView.type === 'complex on', () => html`
            <div class="Icon Active_Icon"></div>
            <div class="Text Active_Text">${translations.privacyPartiallyProtected}</div>
          ` )}
          ${when( switchesView.type === 'complex off', () => html`
            <div class="Icon Inactive_Icon"></div>
            <div class="Text Inactive_Text">${translations.privacyPartiallyDisabled}</div>
          ` )}
        </div>
      </div>


      ${when( switchesView.type !== 'simple', () => html`
              <index-home-switches
                .proxyEnabled="${proxyEnabled}"
                .proxyCountry="${country}"
                .view="${switchesView}"
                @proxyswitch="${proxySwitch}"
                @domainproxyswitch="${domainProxySwitch}"
                @countrychange="${countryChange}"
                @domaincountrychange="${domainCountryChange}">
              </index-home-switches>`,
        () => html`
              <div class="Active_Country_Out">
                <active-country
                  .country="${country}"
                  .countryName="${countryName}"
                  .rating="${switchesView.rating}"
                  @click="${openLocations}"
                ></active-country>
              </div>`
      )}
    </div>
  `;
}
