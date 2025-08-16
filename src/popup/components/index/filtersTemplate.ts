/* global VisibleFilter */
import config from 'config';
import getScrollbarStyle from '../../tools/getScrollbarStyle';
import globalStyle from '../globalStyle';
import IndexFilters from './filters';
import { html } from 'lit';


/** @function */
const classElement = (
  { deleted, disabled, 'value': domain }: VisibleFilter,
  selectedDomain: string | null
): string => {
  let classes = [];
  if( deleted ) classes.push( 'deleted' );
  if( disabled ) classes.push( 'disabled' );
  if( selectedDomain ) {
    classes.push( domain === selectedDomain ? 'active' : 'inactive' );
  }

  return classes.join( ' ' );
};

/** @function */
const computeVisibleCountryFlagUrl = (
  { country }: { 'country': string }
): string => {
  let code: string = country;
  if( code === 'usw' ) code = 'us';
  if( code === 'uk' ) code = 'gb';

  return `/images/flags/${code}.svg`;
};

/** @function */
const domainIcon = ( domain?: string ): string => (
  domain
    ? `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=16`
    : '/images/empty.png'
);

/** @method */
export default function(
  this: IndexFilters,
  translations: { [ key: string ]: string }
) {
  return html`
  <style>
  ${globalStyle}
  .Off{
    width: ${this.language === 'en' ? '30' : '40'}px;
    line-height: 22px;
    padding-left: 1px;
    color: var( --brand-burgundy );
    font-size: 14px;
    text-align: center;
  }

  .ChangeRule_Country{
    position: relative;
    width: ${this.language === 'en' ? '56' : '58'}px;
    border: 1px solid #bcbcbc;
    height: 22px;
    border-radius: 4px;
    padding: 1px 2px;
    background: url( '/images/smart_settings/arrow_up.svg' ) 0 -5000px no-repeat;
  }
  .ChangeRule_Country img{
    display: block;
    border-radius: 4px;
    filter: saturate(135%);
    opacity:0.7;
    border: 1px solid rgba(0, 0, 0, 0.22);
  }
  .ChangeRule_Country::after{
    content: '';
    display: block;
    background: url( '/images/smart_settings/arrow_down.svg' ) 0 0 no-repeat;
    background-size: 100% 100%;
    width: 9px;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    padding-top: 5px;
    position: absolute;
    top: 50%;
    right: 8px;
    margin-top: -2px;
  }
  .ChangeRule_Country.open{
    border-color: var( --brand-green );
  }
  .ChangeRule_Country.open::after{
    background-image: url( '/images/smart_settings/arrow_up.svg' );
    /* margin-top: -3px; */
  }

  .ChangeRule_Button{
    width: 46px;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    padding-top:24px;
    background: var( --brand-green ) url( '../images/smart_settings/agree_white.svg' ) 0 -5000px no-repeat;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
  }
  .ChangeRule_Button::after{
    content: '';
    display: block;
    width: 14px;
    overflow: hidden;
    font-size:0;
    text-indent: -9999px;
    height: 0;
    padding-top:14px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -7px 0 0 -7px;
    background: url( '/images/smart_settings/plus_white.svg' ) 0 0 no-repeat;
    background-size: 100% 100%;
  }
  .ChangeRule_Button.save::after{
    width: 16px;
    padding-top: 11px;
    background-image: url( '/images/smart_settings/agree_white.svg' );
    margin: -5px 0 0 -8px;
  }

  .List{
    position: absolute;
    top:65px;
    right:0px;
    bottom:0px;
    left:0px;
    overflow: auto;
    background: url( '/images/smart_settings/trash_green.svg' ) 0 -5000px no-repeat;
  }
  ${getScrollbarStyle( '.List' )}
  .List > .E{
    position: relative;
    line-height: 34px;
    transition: opacity 0.2s;
  }
  .List > .E:hover{
    background: #fafafa;
  }
  .List > .E.active,
  .List > .E.active:hover{
    background: #f5f5f5;
  }
  .List > .E.inactive,
  .List > .E.inactive:hover{
    background: transparent;
    opacity: 0.33;
  }
  .List > .E.inactive.disabled,
  .List > .E.inactive.disabled:hover{
    background: transparent;
    opacity: 1;
  }
  .List > .E > .In{
    padding: 0 7px 0 14px;
    cursor: pointer;
    height: 34px;
  }
  .List > .E > .In::after{
    content:' ';clear:both;display:block;width:0;height:0;overflow:hidden;font-size:0;
  }

  .List_Remove{
    float: right;
    background: url( '/images/smart_settings/trash_grey.svg' ) 0 0 no-repeat;
    background-size: 100% 100%;
    width: 11px;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    padding-top:14px;
    margin: 3px 0 0 6px;
    cursor: pointer;
    border: 7px solid transparent;
  }
  .List_Remove:hover{
    background-image: url( '/images/smart_settings/trash_green.svg' );
  }
  .List_Flag{
    float: right;
    width: ${this.language === 'en' ? '30' : '40'}px;
    padding: 7px 0 0 13px;
  }
  .List_Flag img{
    display: block;
    border-radius: 4px;
    filter: saturate(135%);
    opacity:0.7;
    border: 1px solid rgba(0, 0, 0, 0.22);
  }

  .ChangeRule{
    padding: 19px 14px;
    border-bottom: 1px solid #bcbcbc;
    display: flex;
    align-items: center;
  }
  .ChangeRule > .E{
    flex-grow: 0;
    flex-shrink: 0;
  }
  .ChangeRule > .E ~ .E{
    padding-left: 10px;
  }
  .ChangeRule > .E.input{
    flex-grow: 1;
  }

  .Mark_Out{
    float: right;
    padding: 0 0 0 13px;
  }
  .Mark{
    display:inline-block;
    vertical-align: middle;
    width: 23px;
    overflow:hidden;
    font-size:0;
    text-indent:-9999px;
    height:0;
    padding-top: 12px;
    background: url( '/images/pings/1.svg' ) 0 0 no-repeat;
    background-size: 100% 100%;
  }
  .Mark.mark2{
    background-image: url( '/images/pings/2.svg' );
  }
  .Mark.mark3{
    background-image: url( '/images/pings/3.svg' );
  }
  .Mark.mark4{
    background-image: url( '/images/pings/4.svg' );
  }
  .Mark.mark5{
    background-image: url( '/images/pings/5.svg' );
  }

  .List_Favicon{
    width: 16px;
    float: left;
    padding: 9px 7px 0 0;
    transition: opacity 0.2s;
  }
  .List > .E.disabled .List_Favicon{
    opacity: 0.3;
  }
  .List_Favicon img{
    display: block;
  }

  .List_Name{
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: opacity 0.2s;
  }
  .List > .E.disabled .List_Name{
    opacity: 0.3;
  }

  .List_Deleted{
    display: none;
    background: #fff;
    position: absolute;
    top:0px;right:0px;bottom:0px;left:0px;
    padding: 0 14px 0 22px;
    border-left: 14px solid transparent;
    color: var( --brand-green );
  }
  .List_Deleted::after{
    content: '';
    width: 12px;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    padding-top:12px;
    background: url('/images/smart_settings/check.svg') 0 0 no-repeat;
    background-size: 100% 100%;
    position: absolute;
    left: 0;
    top: 50%;
    margin-top: -6px;
  }
  .List > .E.deleted .List_Deleted{
    display: block;
  }

  .List_Delete_Link{
    cursor: pointer;
    color: var( --brand-blue );
    border-bottom: 1px dashed var( --brand-blue );
  }
  .List_Delete_Link:hover{
    border-bottom-color: transparent;
  }

  .List_Select{
    float: right;
    padding: 4px 0 0 5px;
  }
  .List_Select_Button{
    line-height: 24px;
    white-space: nowrap;
    cursor: pointer;
    border: 1px solid var( --brand-green );
    color: var( --brand-green );
    padding: 0 8px;
    border-radius: 4px;
    font-size: 12px;
  }
  .List_Select_Button:hover{
    background: var( --brand-green );
    color: #fff;
  }

  .List_InactiveOverlay{
    display: none;
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    overflow: hidden;
    text-indent: -9999px;
  }
  .List > .E.inactive .List_InactiveOverlay{
    display: block;
  }
  </style>

  <div class="ChangeRule">
    ${( () => {
      if( this.language === 'ru' ) return '';

      return html`
    <div class="E text">${translations.on}</div>`;
    })()}

    <div class="E input">
      <filters-domain
        .value="${this.domain}"
        @save="${this.save}"
        @value-changed="${this.inputListener}"
      ></filters-domain>
    </div>
    <div class="E text">${translations.use}</div>
    <div class="E flag">
      <div
        data-role="country selector"
        class="ChangeRule_Country"
        @click="${this.openCountryList}"
      >
      ${( () => {
        if( !this.country ) {
          return html`
          <div class="Off">${translations.off}</div>`;
        }

        const src = computeVisibleCountryFlagUrl({
          'country': this.country,
        });

        return html`
          <img src="${src}" width="30" height="20" alt=""/>`;
      })()}
      </div>
    </div>
    <div class="E button">
      <div
        class="ChangeRule_Button${this.selectedDomain ? ' save' : ''}"
        @click="${this.save}"
      ></div>
    </div>
  </div>

  <div class="List" @click="${this.listClick}">
  ${this.filters.map( item => html`
    <div class="E ${classElement( item, this.selectedDomain )}">
      <div class="In" @click="${this.listElementClick( item )}">
        <div class="List_Remove" title="${translations.removeSmartSetting}"></div>
        ${( () => {
    if( item.disabled ) {
      return html`
        <div class="List_Select">
          <div class="List_Select_Button">${translations.select}</div>
        </div>`;
    }

    return html`
        <div class="List_Flag">
    ${( () => {
      if( !item.country ) {
        return html`
          <div class="Off">${translations.off}</div>`;
      }

      const src = computeVisibleCountryFlagUrl({
        'country': item.country,
      });

      return html`
          <img src="${src}" width="30" height="20" alt=""/>`;
    })()}
        </div>`;
  })()}
        <div class="List_Favicon">
          <img src="${domainIcon( item.value )}" width="16" height="16" alt=""/>
        </div>
        <div class="List_Name">${item.view}</div>
      </div>
      <div class="List_Deleted">
        ${translations.settingWasDeleted}
        <span class="List_Delete_Link" @click="${this.cancelRemove( item )}">
          ${translations.undo}
        </span>
      </div>
      <div class="List_InactiveOverlay" @click="${this.resetSelection}">&nbsp;</div>
    </div>`
  )}
  </div>`;
};
