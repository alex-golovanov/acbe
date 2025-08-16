import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import Browser from 'crossbrowser-webextension';

import { STORAGE } from 'constants/storageKeys';
import internationalize from 'tools/internationalize';
import storage from 'storage';
import jitsu from 'jitsu';

import '../components/header';
import './condition';

const translations: { [key: string]: string } = Object.fromEntries(
  Object.entries({
    ffScreenPrivacyChoicesHeader: 'ff_screen_privacy_choices_header',
    ffScreenPrivacyChoicesText: 'ff_screen_privacy_choices_text',
    ffScreenStatisticalDataHeader: 'ff_screen_statistical_data_header',
    ffScreenStatisticalDataText: 'ff_screen_statistical_data_text',
    ffScreenIdentifiersHeader: 'ff_screen_identifiers_header',
    ffScreenIdentifiersText: 'ff_screen_identifiers_text',
    ffScreenPrivacyPolicyLinkText: 'ff_screen_privacy_policy_link_text',
    ffScreenPrivacyPolicyLinkUrl: 'ff_screen_privacy_policy_link_url',
    ffClickAccept: 'click_accept_terms_and_conditions',
  }).map(([key, value]) => [key, internationalize(value)]),
);

/**
 * @element `firefox-terms-and-conditions` - Component used to display firefox term and condition.
 **/
@customElement('firefox-terms-and-conditions')
export class TermsAndConditions extends LitElement {
  acceptedIdentifiers: boolean;
  acceptedStatisticalData: boolean;
  source: string;

  constructor() {
    super();
    this.acceptedIdentifiers = false;
    this.acceptedStatisticalData = true;
    this.source = 'unknown';
  }

  static get properties() {
    return {
      acceptedIdentifiers: {
        type: Boolean,
        state: true,
      },
      acceptedStatisticalData: {
        type: Boolean,
        state: true,
      },
    };
  }

  /** @method */
  changeIdentifiers() {
    this.acceptedIdentifiers = !this.acceptedIdentifiers;
  }

  /** @method */
  async changeStatisticalData() {
    // toggling new value
    const sendTelemetry = !this.acceptedStatisticalData;
    const dontSendTelemetry = !sendTelemetry;
    await storage.set('dontSendTelemetry', dontSendTelemetry);
    this.acceptedStatisticalData = sendTelemetry;
  }

  /** @method */
  updated(changes: Map<string, any>) {
    const button = <HTMLInputElement>(
      this.renderRoot?.querySelector('#accept-button')
    );
    if (changes.has('acceptedIdentifiers')) {
      button.disabled = !this.acceptedIdentifiers;
    }
  }

  /** @method */
  async clickFFPrivacyPolicy() {
    jitsu.track('accept_policy_privacy', { type: 'tab', source: this.source });
    Browser.tabs.create(translations.ffScreenPrivacyPolicyLinkUrl);
  }

  /** @method */
  async ffAccept() {
    const personal_optout = this.acceptedIdentifiers;

    jitsu.track('personal_optout', {
      enabled: personal_optout ? '1' : '0',
      type: 'tab',
      source: this.source,
    });

    const sendTelemetry = this.acceptedStatisticalData;

    jitsu.track('telemetry_optout', {
      enabled: sendTelemetry ? '1' : '0',
      type: 'tab',
      source: this.source,
    });

    jitsu.track('policy_accepted', { type: 'tab', source: this.source });

    storage.set(STORAGE.startupConditionsAcceptedShown, true);
    storage.set(STORAGE.startupAcceptConditionsPhase, 2);
    window.close();
  }

  /** @method */
  async firstUpdated() {
    this.source = await storage.get( STORAGE.firefoxPolicyTabOpenedSource );

    jitsu.track('accept_policy_view', {
      type: 'tab',
      source: this.source,
    });
  }

  render() {
    return html`
      <tab-header></tab-header>
      <div class="FF_screen">
        <div>
          <div class="Main_header">
            ${translations.ffScreenPrivacyChoicesHeader}
          </div>
          <div class="Text FF_header_text">
            ${translations.ffScreenPrivacyChoicesText}
          </div>
        </div>

        <firefox-condition
          label=${translations.ffScreenStatisticalDataHeader}
          text=${translations.ffScreenStatisticalDataText}
          actionText=${translations.ffScreenPrivacyPolicyLinkText}
          .onActionClick=${this.clickFFPrivacyPolicy.bind(this)}
          .isOn=${this.acceptedStatisticalData}
          .onSwitch=${this.changeStatisticalData.bind(this)}
        ></firefox-condition>

        <firefox-condition
          label=${translations.ffScreenIdentifiersHeader}
          text=${translations.ffScreenIdentifiersText}
          actionText=${translations.ffScreenPrivacyPolicyLinkText}
          .onActionClick=${this.clickFFPrivacyPolicy.bind(this)}
          .isOn=${this.acceptedIdentifiers}
          .onSwitch=${this.changeIdentifiers.bind(this)}
        ></firefox-condition>

        <div class="Button">
          <input
            type="button"
            id="accept-button"
            value="${translations.ffClickAccept}"
            @click="${this.ffAccept}"
            .disabled=${true}
          />
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      position: absolute;
      top: 0px;
      left: 0;
      width: 100%;
      height: 100vh;
      background: white;
      font-size: 14px;
      z-index: 999;
    }

    :host > .In {
      position: absolute;
      bottom: 20px;
      left: 0;
      right: 0;
      text-align: center;
    }

    .Button {
      text-align: center;
      padding-top: 82px;
      box-sizing: border-box;
      width: 100%;
      padding-left: 25px;
      padding-right: 25px;
    }
    .Button input {
      display: block;
      width: 100%;
      margin: 0;
      box-sizing: border-box;
      height: 60px;
      line-height: 100%;
      border: 0;
      cursor: pointer;
      min-width: 200px;
      background: var(--brand-green);
      text-align: center;
      border-radius: 4px;
      color: #fff;
      font-size: 18px;
      font-weight: 600;
    }

    .Button input:disabled,
    input[disabled] {
      background: #e2e2e2;
      cursor: not-allowed;
    }

    .FF_screen {
      height: 520px;
      width: 640px;
      margin: 0 auto;
      text-align: center;

      padding: 80px 25px 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: start;
    }
    .FF_screen .Main_header {
      color: #616675;
      font-size: 18px;
      font-family: Open Sans;
      font-weight: 600;
      line-height: 22px;
      word-wrap: break-word;
      text-align: left;
      margin-bottom: 12px;
    }

    .FF_screen .Text {
      font-family: Open Sans;
      color: #616675;
      font-size: 12px;
      font-weight: 400;
      line-height: 17px;
      word-wrap: break-word;
      text-align: left;
    }

    .FF_screen > .Button {
      text-align: center;
      padding-top: 8px;
      box-sizing: border-box;
      width: 100%;
      padding-left: 0px;
      padding-right: 0px;
    }
    .FF_screen .Button input {
      display: block;
      width: 100%;
      margin: 0;
      box-sizing: border-box;
      height: 60px;
      line-height: 100%;
      border: 0;
      cursor: pointer;
      min-width: 200px;
      background: var(--brand-green);
      text-align: center;
      border-radius: 4px;
      color: #fff;
      font-size: 18px;
      font-weight: 600;
    }

    .FF_screen > .Button input:disabled,
    input[disabled] {
      background: #e2e2e2;
      cursor: not-allowed;
    }
  `;
}
