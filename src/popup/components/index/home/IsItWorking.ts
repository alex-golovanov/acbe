import getUserLanguage from 'tools/getUserLanguage';
import globalStyle from '../../globalStyle';
import jitsu from 'jitsu';
import { html, LitElement } from 'lit';

import internationalize from 'tools/internationalize';

const translations: { [key: string]: string } = Object.fromEntries(
  Object.entries({
    'isItWorking': 'is_it_working', // ${language === 'ru' ? 'Работает?' : 'Is it working?'}
    'isItWorkingYes': 'is_it_working_yes', // ${language === 'ru' ? 'Да!' : 'Yes!'}
    'isItWorkingNo': 'is_it_working_no', // ${language === 'ru' ? 'Исправьте!' : 'No, fix it'}
  }).map( ( [ key, value ] ) => [ key, internationalize( value ) ] ),
);

const language = getUserLanguage();

class IsItWorking extends LitElement {
  render() {
    return html` <style>
        ${globalStyle} :host {
          display: block;
        }

        .Text {
          text-align: center;
          font-size: 18px;
          font-weight: 600;
        }
        .Buttons {
          padding: 60px 0 0;
          display: flex;
          justify-content: center;
          font-weight: 600;
        }
        .Buttons > .E {
          flex-grow: 0;
        }
        .Buttons > .E:first-child {
          padding-right: 7px;
        }
        .Buttons > .E:last-child {
          padding-left: 7px;
        }
        .Button {
          background: #ffffff;
          box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.25);
          border-radius: 3px;
          line-height: 27px;
          padding: 0 12px 0 32px;
          cursor: pointer;
          position: relative;
          min-width: ${language === 'ru' ? '69' : '49'}px;
          text-align: center;
        }
        .Button::before {
          content: '';
          display: block;
          width: 14px;
          height: 15px;
          position: absolute;
          left: 12px;
        }
        .Button.yes {
          font-size: 14px;
          color: #569650;
        }
        .Button.yes::before {
          background: url('/images/like.svg#like') 0 0 no-repeat;
          top: 5px;
        }
        .Button.no {
          font-size: 12px;
          color: #8e392f;
        }
        .Button.no::before {
          background: url('/images/like.svg#dislike') 0 0 no-repeat;
          top: 7px;
        }
      </style>

      <div class="IsItWorking">
        <div class="Text">${translations.isItWorking}</div>
        <div class="Buttons">
          <div class="E">
            <div
              class="Button yes"
              @click="${() => {
                this.buttonClick( 'yes' );
              }}"
            >
              ${translations.isItWorkingYes}
            </div>
          </div>
          <div class="E">
            <div
              class="Button no"
              @click="${() => {
                this.buttonClick( 'no' );
              }}"
            >
              ${translations.isItWorkingNo}
            </div>
          </div>
        </div>
      </div>`;
  }

  /** @method */
  buttonClick( variant: 'no' | 'yes' ) {
    jitsu.track( 'feedback_yesno_' + variant );

    this.dispatchEvent( new CustomEvent( 'choose', { 'detail': variant }) );
  }
}
customElements.define( 'is-it-working', IsItWorking );
