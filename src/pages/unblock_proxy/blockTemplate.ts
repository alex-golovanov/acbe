import internationalize from 'tools/internationalize';
import MainBlock from './block';
import { html } from 'lit';

import '../components/header';


const translations/*: { [ string ]: string }*/ = Object.fromEntries(
  Object.entries({
    'becauseYourProxySettingsAreBlocked':
      'because_your_proxy_settings_are_blocked',
    'browsecIsEnabled': 'browsec_is_enabled',
    'cantSetupSecureConnection': 'cant_setup_secure_connection',
    'contactSupport': 'contact_support',
    'continueUsingBrowsecToOpenWebsites':
      'continue_using_browsec_to_open_websites',
    'disableSelectedExtensions': 'disable_selected_extensions',
    'fixProxySettings': 'fix_proxy_settings',
    'pleaseTryAgainOrContactSupport': 'please_try_again_or_contact_support',
    'selectAllowInPopupWindow': 'select_allow_in_popup_window',
    'somethingWentWrong': 'something_went_wrong',
    'tryAgain': 'try_again',
    'yourProxySettingsAreBlocked': 'your_proxy_settings_are_blocked'
  }).map(
    ( [ key, value ] ) => ( [ key, internationalize( value ) ] )
  )
);


/** @method */
export default function( this: MainBlock ) {
  return html`
  <style>
  :host{
    display: block;
    min-height: 100%;
    height: 100%;
  }

  table{
    border-collapse: collapse;
  }
  td, th{
    padding: 0;
  }

  a{
    color:#1c304e;
    text-decoration: none;
  }
  a:hover,
  a:focus{
    color:#1c304e;
    text-decoration: underline;
  }

  p{
    padding: 0;
    margin: 0 0 20px;
  }

  .Body{
    display: table;
    width: 100%;
    height: 100%;
  }
  .Body > .In{
    display: table-cell;
    vertical-align: middle;
    padding: 0 72px;
  }

  .Box{
    width: 820px;
    max-width: 90%;
    box-sizing: border-box;
    padding: 45px;
    border: 1px solid transparent;
    border-radius: 4px;
    margin: 0 auto;
  }
  .Box.warning{
    border-color: #a9b0b5;
  }

  /** All successfully saved */
  .Box.success{
    border-color: var( --brand-green );
    text-align: center;
  }
  .Box_Success_Ok{
    font-size: 22px;
    line-height: 50px;
    padding-bottom: 15px;
    color: var( --brand-green );
    text-transform: uppercase;
  }
  .Box_Success_Ok > .In{
    display: inline-block;
    padding-left: 70px;
    position: relative;
  }
  .Box_Success_Ok > .In::after{
    content: '';
    display: block;
    position: absolute;
    top: calc(50% - 24px);
    left: 0;
    width: 48px;
    padding-top: 48px;
    height: 0;
    overflow: hidden;
    background: url( '/images/unblock_proxy/checked.svg' ) no-repeat 0 0;
    background-size: 100% 100%;
  }
  .Box_Success_Text{
    color: #7a7c7f;
  }

  .Box.error{
    border-color: var( --brand-burgundy );
    text-align: center;
  }
  .Box_Error_ErrorText{
    font-size: 22px;
    line-height: 50px;
    text-transform: uppercase;
    padding-bottom: 15px;
    color: var( --brand-burgundy );
  }
  .Box_Error_ErrorText > .In{
    display: inline-block;
    position: relative;
    padding-left: 70px;
  }
  .Box_Error_ErrorText > .In::after{
    content: '';
    display: block;
    position: absolute;
    top: calc(50% - 24px);
    left: 0;
    width: 48px;
    padding-top: 48px;
    height: 0;
    overflow: hidden;
    background: url( '/images/unblock_proxy/error.svg' ) no-repeat 0 0;
    background-size: 100% 100%;
  }
  .Box_Error_Text{
    color: #7a7c7f;
  }


  .SettingsBlocked{
    color: #7a7c7f;
    text-align: center;
  }
  .SettingsBlocked_Title{
    font-family: 'Open Sans', Arial, sans-serif;
    font-weight:400;
    text-transform: uppercase;
    font-size: 22px;
    color: #7a7c7f;
    text-align: center;
    padding: 0 0 30px;
  }
  .SettingsBlocked_Title:after{
    content: '';
    display: block;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;padding-top:4px;
    width: 100px;
    margin: 15px auto 0;
    background: var( --brand-green );
  }
  .SettingsBlocked_Advice{
    padding-top: 20px;
    font-size: 14px;
  }

  .Extensions table{
    margin: 0 auto;
  }
  .Extensions table>tbody>tr+tr>td{
    padding-top: 7px;
  }
  .Extensions td.Extensions_Square{
    width: 1px;
    padding-right: 10px;
  }
  .Extensions_Square>.In{
    display: table;
    height: 38px;
  }
  .Extensions_Square>.In>.In{
    display: table-cell;
    vertical-align: middle;
  }
  .Extensions_Square input[type="checkbox"]{
    display: block;
    width: 13px;
    height: 13px;
    margin: 0 auto;
  }
  .Extensions_Square img{
    display: block;
    margin: 0 auto;
    border: 1px solid #c4c4c4;
    padding: 14px;
  }
  .Extensions_Name{
    font-size: 14px;
  }
  .Extensions_Button{
    text-align: center;
    padding-top: 30px;
  }

  .ContactSupport{
    font-size: 12px;
    margin-bottom: -10px;
  }
  .ContactSupport a{
    position: relative;
    padding-left: 30px;
    text-decoration: underline;
  }
  .ContactSupport a::after{
    content: '';
    display: block;
    position: absolute;
    top: calc(50% - 15px / 2);
    left: 0;
    background: url( '/images/unblock_proxy/email.svg' ) no-repeat 0 center;
    background-size: 100% 100%;
    width: 20px;
    padding-top: 15px;
    height: 0;
    overflow: hidden;
  }

  .btn{
    box-shadow: none;
    box-sizing: border-box;
    display: inline-block;
    font-weight: normal;
    text-align: center;
    touch-action: manipulation;
    cursor: pointer;
    background: none;
    background-color: var( --brand-green );
    padding: 10px 30px;
    border-radius: 4px;
    border: none;
    -webkit-user-select: none;
    user-select: none;
    color: #66717e;
    font-size: 18px;
    color: #FFF;
    cursor: pointer;
    transition: background-color .3s;
  }
  .btn:focus{
    outline: none;
  }
  .btn.try-again{
    background: #1c304e;
    margin: 20px 0 10px;
    width: 300px;
  }
  </style>

 <tab-header></tab-header>

  <div class="Body"><div class="In">
    ${( () => {
    switch( this.mode ) {
      case 'information': return html`
    <div class="Box warning">
    ${( () => {
      if( !this.hasManagement ) {
        return html`
      <div class="SettingsBlocked">
        <div class="SettingsBlocked_Title">${
          translations.yourProxySettingsAreBlocked
       }</div>
        <p>
          ${translations.cantSetupSecureConnection}<br/>
          ${translations.becauseYourProxySettingsAreBlocked}
        </p>

        <div>
          <div><button class="btn" @click="${this.scanExtensions}">${
            translations.fixProxySettings
         }</button></div>
          <div class="SettingsBlocked_Advice">${
            translations.selectAllowInPopupWindow
         }</div>
        </div>
      </div>`;
      }

      return html`
      <div class="Extensions">
        <table><tbody>
      ${this.extensions.map( item => html`
          <tr>
            <td class="Extensions_Square"><div class="In"><div class="In">
              <input type="checkbox" ?checked="${item.checked}" @change="${this.extensionCheckbox}"/>
            </div></div></td>
            <td class="Extensions_Square"><div class="In"><div class="In">
              ${item.icon ? html`<img src="${item.icon}" />` : ''}
            </div></div></td>
            <td><div class="Extensions_Name">"${item.name}"</div></td>
          </tr>`
      )}
        </tbody></table>
        <div class="Extensions_Button"><button class="btn" @click="${this.disableExtensions}">${
          translations.disableSelectedExtensions
       }</button></div>
      </div>`;
    })()}
    </div>`;

      case 'success': return html`
    <div class="Box success">
      <div class="Box_Success_Ok"><div class="In">${
        translations.browsecIsEnabled
     }</div></div>
      <div class="Box_Success_Text">${
        translations.continueUsingBrowsecToOpenWebsites
     }</div>
    </div>`;

      case 'error': return html`
    <div class="Box error">
      <div class="Box_Error_ErrorText"><div class="In">${
        translations.somethingWentWrong
     }</div></div>
      <div class="Box_Error_Text">${
        translations.pleaseTryAgainOrContactSupport
     }</div>
      <div><button class="try-again btn" @click="${this.scanExtensions}">${
        translations.tryAgain
     }</button></div>
      <div class="ContactSupport">
        <a href="${this.contactSupportUrl}" target="_blank">${
          translations.contactSupport
       }</a>
      </div>
    </div>`;

      default: return '';
    }
  })()}
  </div></div>`;
};
