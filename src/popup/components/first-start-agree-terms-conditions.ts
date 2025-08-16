import globalStyle from './globalStyle';
import internationalize from 'tools/internationalize';
import { LitElement, html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import Browser from 'crossbrowser-webextension';
import jitsu from 'jitsu';
import storage from 'storage';

const divider = '{DIVIDER}';
const clickHereTranslation = internationalize( 'click_here_to_agree_and_start' );
const [ before, between, after ] = clickHereTranslation.split( divider );
const termsConditions = internationalize( 'click_here_terms_conditions' );
const privacyPolicy = internationalize( 'click_here_privacy_policy' );
const acceptTranslation = internationalize( 'click_accept_terms_and_conditions' );


class FirstStartAgreeTermsConditions extends LitElement {
  isFirefox: boolean;
  bottom: number;
  acceptedIdentifiers: boolean;
  acceptedStatisticalData: boolean;

  constructor() {
    super();

    this.bottom = 0;
    this.acceptedIdentifiers = false;
    this.acceptedStatisticalData = true;
    this.isFirefox = typeof browser !== 'undefined';
  }

  static get properties() {
    return {
      'acceptedIdentifiers': {
        'type': Boolean,
        'state': true
      },
      'acceptedStatisticalData': {
        'type': Boolean,
        'state': true
      },
    }
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
    await storage.set( 'dontSendTelemetry', dontSendTelemetry );
    this.acceptedStatisticalData = sendTelemetry;
  }

  render() {
    return html`
    <style>
    ${globalStyle}
    :host{
      display:block;
      position: absolute;
      top: 0px;
      left: 0;
      width: 100%;
      height: 100vh;
      background: white;
      font-size: 14px;
      z-index: 999;
    }

    :host > .In{
      position: absolute;
      bottom: ${this.bottom}px;
      left: 0;
      right: 0;
      text-align: center;
    }
    .Text{
      font-size: 16px;
      line-height: 1.4;
      letter-spacing: -0.41px;
      font-weight: 400;
      text-align: center;
      color: #616675;
      margin-bottom: 0px;
    }
    .Text a {
        color: #007AFF;
        text-decoration: none;
    }
    .Link {
        font-size: 16px;
        line-height: 1.4;
        letter-spacing: -0.41px;
        font-weight: 400;
        text-align: center;
        margin-bottom: 0px;
        color: #007AFF;
        text-decoration: none;
        cursor: pointer;
    }
    .Button {
        text-align: center;
        padding-top: 82px;
        box-sizing: border-box;
        width: 100%;
        padding-left: 25px;
        padding-right: 25px;
      }
    .Button input{
        display: block;
        width: 100%;
        margin: 0;
        box-sizing: border-box;
        height: 60px;
        line-height: 100%;
        border: 0;
        cursor: pointer;
        min-width: 200px;
        background: var( --brand-green );
        text-align: center;
        border-radius: 4px;
        color: #fff;
        font-size: 18px;
        font-weight: 600;
      }

      .Button input:disabled, input[disabled] {
        background: #E2E2E2;
        cursor: not-allowed;
      }
    </style>

    <main-head hideLogin></main-head>
    ${this.standardScreen()}`;
  }

  standardScreen() {
    return html`
    <div class="In">
        <div class="Text">${unsafeHTML( before )}
        <span class="Link" @click="${this.clickTermsConditions}">${unsafeHTML( termsConditions )}</span>
        ${unsafeHTML( between )} 
        <span class="Link" @click="${this.clickPrivacyPolicy}">${unsafeHTML( privacyPolicy )}</span>
        ${unsafeHTML( after )}</div>  
        <div class="Button">
          <input 
            type="button" 
            value="${acceptTranslation}" 
            @click="${this.accept}"
          />
        </div>
    </div>`;
  }

  /** @method */
  // @ts-ignore
  updated( changes: Map<string, any> ) {
    // Firefox only
    if ( !(this.isFirefox) ) return;

    const button = <HTMLInputElement>this.renderRoot?.querySelector( '#accept-button' );
    if ( changes.has( 'acceptedIdentifiers' ) ) {
      button.disabled = !this.acceptedIdentifiers;
    }
  }

  /** @method */
  clickTermsConditions() {
    jitsu.track( 'accept_policy_terms' );
    Browser.tabs.create( 'https://browsec.com/en/terms_of_service' );
  }

  /** @method */
  clickPrivacyPolicy() {
    jitsu.track( 'accept_policy_privacy', { type: 'ext' } );
    Browser.tabs.create( 'https://browsec.com/en/privacypolicy' );
  }

  /** @method */
  accept() {
    this.dispatchEvent( new CustomEvent( 'accept' ) );
  }
};
customElements.define( 'first-start-agree-terms-conditions', FirstStartAgreeTermsConditions );
