import createTranslation from '../tools/createTranslationObject';
import globalStyle from './globalStyle';
import MainHead from './head';
import { html } from 'lit';


const translations: { [ key: string ]: string } = createTranslation({
  'goBack': 'go_back',
  'signIn': 'sign_in',
  'signOut': 'sign_out'
});


/** @method */
export default function( this: MainHead ) {
  return html`
  <style>
  ${globalStyle}
  :host{
    display: block;
    height: 56px;
    line-height: 56px;
    border: 1px solid var( --brand-blue );
    border-width: 0 5px 0 5px;
    background: var( --brand-blue );
    color: #fff;
    overflow: hidden;
    position: relative;
  }
  :host::after{
    content:' ';clear:both;display:block;width:0;height:0;overflow:hidden;font-size:0;
  }
  :host > .In{
    overflow: hidden;
    height: 100%;
    text-align: right;
  }

  .GoBack{
    cursor: pointer;
    display:inline-block;
    vertical-align:middle;
    position:relative;
    color:#b3becf;
    font-size:14px;
    text-decoration: underline;
    padding: 0 5px 0 18px;
    background: url( '/images/back_hover.svg' ) no-repeat 0 -5000px;
  }
  .GoBack:hover{
    color: white;
    text-decoration: none;
  }

  .GoBack::before{
    content:'';
    background: url( '/images/back.svg' ) no-repeat 50% 50%;
    background-size: 100% 100%;
    width: 13px;
    height: 13px;
    display: block;
    position: absolute;
    left: 0;
    top: 50%;
    margin-top: -6px;
  }
  .GoBack:hover::before{
    background-image: url( '/images/back_hover.svg' );
  }

  .LoginGuest{
    color: #fff;
    cursor: pointer;
    text-decoration: underline;
    display: inline-block;
    vertical-align: top;
    padding: 0 5px 0 5px;
  }
  .LoginGuest:hover{
    text-decoration: none;
  }

  .Logined{
    height: 24px;
    line-height: 24px;
    width: 100%;
    display:inline-block;
    vertical-align:top;
    vertical-align: middle;
  }
  .Logined::after{
    content:' ';clear:both;display:block;width:0;height:0;overflow:hidden;font-size:0;
  }

  .Logout{
    float: right;
    cursor: pointer;
    width: 20px;
    padding-top: 20px;
    overflow: hidden;
    height: 0;
    background: url( '/images/logout_grey.svg' ) 0 0 no-repeat;
    background-size: 100% 100%;
    border: 2px solid transparent;
    position: relative;
  }
  .Logout:hover{
    background-image: url( '/images/logout_white.svg' );
  }
  .Logout::after{
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    overflow: hidden;
    background: url( '/images/logout_white.svg' ) 0 -5000px no-repeat;
  }

  .Mail{
    vertical-align: middle;
    padding: 0 8px 0 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  </style>

  <head-logo .premium="${this.user.premium}"></head-logo>
  <div class="In">
  ${( () => {
    if( this.hideLogin ) return html``;

    if( !this.indexPage ) {
      return html`
      <div class="GoBack" @click="${this.back}">${
        translations.goBack
     }</div>`;
    }

    if( !this.user.email ) {
      return html`
      <div class="LoginGuest" @click="${this.login}">
        ${translations.signIn}
      </div>`;
    }

    return html`
    <div class="Logined">
      <div class="Logout" @click="${this.logout}" title="${translations.signOut}"></div>
      <div class="Mail" title="${this.user.email}">${this.user.email}</div>
    </div>`;
  })()}
  </div>`;
};
