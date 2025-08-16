/* global SwitchesViewComplexOn, SwitchesViewComplexOff */
import createTranslation from '../../../tools/createTranslationObject';
import globalStyle from '../../globalStyle';
import { LitElement, html } from 'lit';
import { when } from 'lit/directives/when.js';

const translations: { [ key: string ]: string } = createTranslation({
  'otherWebsites': 'other_websites',
  'dependentWebsite': 'dependent_website'
});

// Computed properties
/** @function */
const flagUrl = ( flag: string | void ): string => {
  if( flag === 'usw' ) flag = 'us';
  if( flag === 'uk' ) flag = 'gb';

  return flag ? `/images/flags/${flag}.svg` : '/images/empty.png';
};

class IndexHomeSwitches extends LitElement { // @ts-ignore
  proxyCountry: string; // @ts-ignore
  proxyEnabled: boolean;
  view: SwitchesViewComplexOff | SwitchesViewComplexOn;

  render() {
    return html`
      <style>
        ${globalStyle}
        :host {
          display: block;
        }

        .Row::after {
          content: ' ';
          clear: both;
          display: block;
          width: 0;
          height: 0;
          overflow: hidden;
          font-size: 0;
        }

        .Row + .Row {
          padding-top: 8px;
        }

        .Switch,
        .Flag_Out {
          float: right;
          width: 61px;
          padding-left: 11px;
          min-height: 1px;
        }

        .Name {
          white-space: nowrap;
          overflow: hidden;
          line-height: 26px;
          text-overflow: ellipsis;
        }
        
        .Dependent_Name {
          white-space: nowrap;
          overflow: hidden;
          line-height: 12px;
          text-overflow: ellipsis;
          font-size: 10px;
        }

        .Flag {
          border: 1px solid #bcbcbc;
          border-radius: 3px;
          padding: 2px 27px 2px 2px;
          cursor: pointer;
          position: relative;
        }

        .Flag:hover {
          border-color: #888;
        }

        .Flag::after {
          content: '';
          display: block;
          background: url('/images/flag_arrow_right.svg') 0 0 no-repeat;
          background-size: 100% 100%;
          width: 5px;
          overflow: hidden;
          font-size: 0;
          text-indent: -9999px;
          height: 0;
          padding-top: 9px;
          position: absolute;
          right: 10px;
          top: 50%;
          margin-top: -4px;
        }

        .Flag img {
          display: block;
          border-radius: 4px;
          filter: saturate(135%);
          opacity: 0.7;
          border: 1px solid rgba(0, 0, 0, 0.22);
        }
      </style>

      <div class="Row">
        <div class="Switch">
          <c-switch .on="${this.view.type === 'complex on'}" @click="${this.domainProxySwitch}"></c-switch>
        </div>
        <div class="Flag_Out">
          ${when( ( 'country' in this.view ), () => html`
            <div class="Flag" @click="${this.domainCountryChange}">
              <img src="${flagUrl( this.view.country! )}" width="30" height="20" alt="${this.view.country!}" />
            </div>
          ` )}
        </div>
        <div class="Name">${this.view.view}</div>
        ${when( this.view.dependentDomain, () => html`
          <div class="Dependent_Name">${`${translations.dependentWebsite} ${this.view.dependentDomain}`}</div> ` )}
      </div>

      <div class="Row">
        <div class="Switch">
          <c-switch .on="${this.proxyEnabled}" @click="${this.proxySwitch}"></c-switch>
        </div>
        <div class="Flag_Out">
          ${when( this.proxyEnabled, () => html`
            <div class="Flag" @click="${this.countryChange}">
              <img src="${flagUrl( this.proxyCountry )}" width="30" height="20" alt="${this.proxyCountry}" />
            </div>`
          )}
        </div>
        <div class="Name">${translations.otherWebsites}</div>
      </div>`;
  }
  static get properties() {
    return {
      'proxyEnabled': {
        'type': Boolean
      },
      'proxyCountry': {
        'type': String
      },
      'view': {
        'type': Object
      }
    };
  }

  constructor() {
    super();

    // @ts-ignore
    this.view = {};
  }

  // Methods
  /** @method */
  proxySwitch()/*: void*/ {
    this.dispatchEvent( new CustomEvent( 'proxyswitch' ) );
  }

  /** @method */
  domainProxySwitch()/*: void*/ {
    this.dispatchEvent( new CustomEvent( 'domainproxyswitch' ) );
  }

  /** @method */
  countryChange()/*: void*/ {
    this.dispatchEvent( new CustomEvent( 'countrychange' ) );
  }

  /** @method */
  domainCountryChange()/*: void*/ {
    this.dispatchEvent( new CustomEvent( 'domaincountrychange' ) );
  }
}
customElements.define( 'index-home-switches', IndexHomeSwitches );
