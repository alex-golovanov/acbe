/* global LitUpdatedChanges */
import createTranslation from '../tools/createTranslationObject';
import storage from 'storage';
import { LitElement, PropertyValues, html } from 'lit';
import globalStyle from './globalStyle';


const translations: { [ key: string ]: string } = createTranslation({
  'on': 'on',
  'off': 'off'
});


class Switch extends LitElement {
  language: string;// @ts-ignore
  on: boolean;
  unsubscribe?: () => any;

  render() {
    return html`
    <style>
    ${globalStyle}
    :host{
      display: block;
      width: ${this.language === 'en' ? '61' : '70'}px;
      height: 26px;
      cursor: pointer;
      position: relative;
    }
    :host(.grayscale){
      filter: grayscale(1);
    }
    :host *{
      cursor: pointer;
    }
    .BackgroundText{
      display: block;
      background: var( --brand-burgundy );
      border-radius: 13px;
      width: ${this.language === 'en' ? '61' : '70'}px;
      height: 26px;
      line-height: 26px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12) inset, 0 0 2px rgba(0, 0, 0, 0.15) inset;
      font-size: 13px;
      height: inherit;
      position: relative;
      text-transform: uppercase;
      transition: all 0.15s ease-out 0s;
    }
    .BackgroundText_Off,
    .BackgroundText_On{
      position: absolute;
      top: 0;
      transition: inherit;
    }
    .BackgroundText_Off{
      color: #fff;
      right: 8px;
    }
    .BackgroundText_On{
      color: white;
      left: 11px;
      opacity: 0;
      text-shadow: 0 1px rgba(0, 0, 0, 0.2);
    }
    :host(.on) .BackgroundText{
      background: var( --brand-green );
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15) inset, 0 0 3px rgba(0, 0, 0, 0.2) inset;
    }
    :host(.on) .BackgroundText_Off{
      opacity: 0;
    }
    :host(.on) .BackgroundText_On{
      opacity: 1;
    }

    .Circle{
      background: #fff;
      border-radius: 11px;
      height: 22px;
      width: 22px;
      left: 2px;
      position: absolute;
      top: 2px;
      transition: left 0.15s ease-out 0s;
    }
    .Circle:before{
      content: "";
      background: #f9f9f9 linear-gradient(to bottom, #eeeeee, white) repeat scroll 0 0;
      border-radius: 6px;
      box-shadow: 0 1px rgba(0, 0, 0, 0.02) inset;
      height: 12px;
      left: 50%;
      margin: -6px 0 0 -6px;
      position: absolute;
      top: 50%;
      width: 12px;
    }
    :host(.on) .Circle{
      box-shadow: -1px 1px 5px rgba(0, 0, 0, 0.2);
      left: ${this.language === 'en' ? '37' : '46'}px; /* left: auto; right: 2px; */
    }
    </style>

    <div class="BackgroundText">
      <div class="BackgroundText_Off">${this.translations.off}</div>
      <div class="BackgroundText_On">${this.translations.on}</div>
    </div>
    <div class="Circle"></div>`;
  }
  static get properties() {
    return {
      'on': {
        'type': Boolean,
        'observer': 'observeOn'
      },
      'translations': {
        'type': Object
      }
    };
  }

  // Read-only properties
  get translations() {
    return translations;
  }

  // Lifecycle
  constructor() {
    super();

    // @ts-ignore
    this.language = window.language as string;
  }

  /** @method */
  async firstUpdated( changedProperties: PropertyValues<any> ) {
    super.firstUpdated( changedProperties );

    const storageValue = await storage.get( 'reanimator: in progress' );
    if( storageValue ) this.classList.add( 'grayscale' );

    this.unsubscribe = storage.onChange({
      'for': [ 'reanimator: in progress' ],
      'do': ( storageData: Record<string, any> ) => {
        const value = storageData[ 'reanimator: in progress' ];

        if( value ) this.classList.add( 'grayscale' );
        else this.classList.remove( 'grayscale' );
      }
    });
  }

  // @ts-ignore
  updated( changes: LitUpdatedChanges<Switch> ) {
    if( changes.has( 'on' ) ) this.classList.toggle( 'on', this.on );
  }

  /** @method */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }
};
customElements.define( 'c-switch', Switch );
