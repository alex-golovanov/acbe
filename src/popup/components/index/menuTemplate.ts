import createTranslation from '../../tools/createTranslationObject';
import globalStyle from '../globalStyle';
import IndexMenu from './menu';
import { html } from 'lit';


const translations: { [ key: string ]: string } = createTranslation({
  'contactUs': 'contact_us',
  'home': 'home',
  'smartSettings': 'smart_settings'
});


/** @method */
export default function( this: IndexMenu ) {
  return html`
  <style>
  ${globalStyle}
  a:link,
  a:visited{
    text-decoration: none;
    cursor: pointer;
    color: #7a7c7f;
  }
  a:hover{
    text-decoration: none;
    color: var( --brand-green );
  }

  :host{
    display: flex;
    align-items: flex-start;
    padding-top: 6px;
    margin-right: 70px;
  }
  :host > .E{
    flex-grow: 0;
    flex-shrink: 0;
    position: relative;
    color: #7a7c7f;
    cursor: pointer;
    font-size: 12px;
    line-height: 30px;
    margin: 0 0 0 10px;
  }
  @media( max-width: 401px ){
    :host > .E{
      margin-left: 8px;
    }
  }
  @media( max-width: 380px ){
    :host > .E{
      margin-left: 10px;
    }
  }

  :host > .E:hover{
    color: var( --brand-green );
  }
  :host > .E:first-of-type{
    margin-left: 0;
  }
  :host > .E.selected{
    color: var( --brand-green );
    cursor: default;
  }

  :host > .E::before{
    font-size: 14px;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    line-height: 30px;
  }

  :host > .E.home::before{
    content: '';
    display:inline-block;
    vertical-align:middle;
    background: url( '/images/menu/home.svg#grey' ) 0 0 no-repeat;
    background-size: 100% 100%;
    width: 12px;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    padding-top: 10px;
    position: static;
    margin-top: -3px;
    border-right: 3px solid transparent;
  }
  :host > .E.home.selected::before,
  :host > .E.home:hover::before{
    background-image: url( '/images/menu/home.svg#green' );
  }

  :host > .E.settings{
    width: 14px;
    height: 30px;
    cursor: pointer;
    position: relative;
  }
  :host > .E.settings::before{
    content: '';
    display: block;
    width: 1px;
    height: 1px;
    overflow:hidden;
    background: url( '/images/settings.svg#green' ) -5000px 0 no-repeat;
  }
  :host > .E.settings::after{
    content: '';
    display: block;
    width: 14px;
    height: 14px;
    position: absolute;
    top: calc( 50% - 14px / 2 );
    left: 0;
    background: url( '/images/settings.svg#grey' ) 50% 50% no-repeat;
    background-size: 100% 100%;
  }
  :host > .E.settings.selected::after,
  :host > .E.settings:hover::after{
    background-image: url( '/images/settings.svg#green' )
  }

  :host > .E.smartSettings{
    position: relative;
    padding-right: 21px;
    background: url( '/images/menu/settings_green.svg' ) 0 -5000px no-repeat;
  }
  @media( max-width: 380px ){
    :host > .E.smartSettings{
      padding-right: 0px;
      width: 16px;
      overflow: hidden;
    }
  }
  :host > .E.smartSettings::before{
    content: '';
    display:inline-block;
    vertical-align:middle;
    background: url( '/images/menu/settings_grey.svg' ) 0 0 no-repeat;
    background-size: 100% 100%;
    width: 14px;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    padding-top:11px;
    position: static;
    margin-top: -3px;
    padding-right: 3px;
  }

  :host > .E.smartSettings:after{
    content: '';
    display: block;
    background: url( '/images/beta.svg' ) 0 0 no-repeat;
    background-size: 100% 100%;
    position: absolute;
    right: 0;
    top: 50%;
    margin-top: -16px;
    width: 18px;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    padding-top:18px;
  }
  @media( max-width: 380px ){
    :host > .E.smartSettings:after{
      display: none;
    }
  }

  :host > .E.smartSettings.selected::before,
  :host > .E.smartSettings:hover::before{
    background-image: url( '/images/menu/settings_green.svg' );
  }

  :host > .E.icon{
    width: 32px;
    min-height: 30px;
  }
  :host > .E.icon a{
    display: block;
    width: 32px;
    height: 0;
    padding-top: 32px;
    overflow: hidden;
    position: absolute;
    left: 0;
    top: calc(50% - 16px);
    margin-top: -1px;
    border-radius: 50%;
  }
  :host > .E.icon a::before{
    content: '';
    display: block;
    position: absolute;
  }
  :host > .E.icon a:focus{
    background-color: #e6e6e6;
  }

  :host > .E.support{
    margin-left: 7px;
    background: url( '/images/menu/mail_green.svg' ) 0 -5000px no-repeat;
  }
  @media( max-width: 380px ){
    :host > .E.support{
      margin-left: 1px;
    }
  }
  :host > .E.support a::before{
    background: url('/images/menu/mail_grey.svg') 0 0 no-repeat;
    background-size: 100% 100%;
    width: 12px;
    overflow: hidden;
    padding-top: 9px;
    height: 0;
    top: calc(50% - 4px);
    left: calc(50% - 6px);
    margin-top: 1px;
  }
  :host > .E.support a:hover::before{
    background-image: url( '/images/menu/mail_green.svg' );
  }

  :host > .E.telegram{
    margin-left: 0;
  }
  :host > .E.telegram a::before{
    background: url( '/images/menu/telegram.svg#general' ) 0 0 no-repeat;
    background-size: 100% 100%;
    width: 22px;
    overflow: hidden;
    padding-top: 22px;
    height: 0;
    position: absolute;
    top: calc(50% - 11px);
    left: calc(50% - 11px);
    margin-top: 0px;
  }
  </style>
  <div class="E home ${this.homePage ? 'selected' : ''}" @click="${this.goHome}">${
    translations.home
 }</div>
  <div class="E settings ${this.settingsPage ? 'selected' : ''}" @click="${this.goSettings}"></div>
  <div
    class="E smartSettings ${this.filtersPage ? 'selected' : ''}"
    @click="${this.openSettings}"
    @contextmenu="${this.openSettings}">${translations.smartSettings}</div>
  <div class="E icon support">
    <a href="${this.contactUsUrl}" target="_blank" @click="${this.contactUsClick}">${
      translations.contactUs
   }</a>
  </div>
  <div class="E icon telegram">
    <a href="${this.telegramUrl}" target="_blank" @click="${this.telegramClick}">Facebook</a>
  </div>`;
};
