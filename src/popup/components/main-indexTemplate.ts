import createTranslation from '../tools/createTranslationObject';
import globalStyle from './globalStyle';
import MainIndex from './main-index';
import { html } from 'lit';


const translations: { [ key: string ]: string } =
  createTranslation({ 'help': 'help' });


/** @method */
export default function( this: MainIndex ) {
  return html`
  <style>
  ${globalStyle}
  .Foot{
    height: 38px;
    padding: 0 10px;
    border-top: 1px solid #bcbcbc;
    background: #f5f5f5;
    position: absolute;
    right:0px;
    bottom:0px;
    left:0px;
  }
  .Foot::after{
    content:' ';
    display:block;
    clear:both;
    width:0;height:0;
    overflow:hidden;
    font-size:0;
  }
  .Foot c-switch{
    position: absolute;
    top: 7px;
    right: 10px;
  }

  .Switch{
    position: absolute;
    top:0px;bottom:38px;left:0px;
    width: 100%;
    white-space: nowrap;
  }
  .Switch > *{
    display:inline-block;
    vertical-align:top;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    white-space: normal;
  }

  .Help{
    position: absolute;
    top: 12px;
    right: 10px;
    padding-left: 19px;
    cursor: pointer;
    font-size: 12px;
    line-height: 18px;
    color: var( --brand-green );
    background: url( '/images/menu/help_green.svg' ) 0 -5000px no-repeat;
  }
  .Help::after{
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 50%;
    margin-top: -7px;
    background: url( '/images/menu/help_grey.svg' ) 0 0 no-repeat;
    background-size: 100% 100%;
    width: 14px;
    padding-top:14px;
    overflow:hidden;
    font-size:0;
    text-indent:-9999px;
    height:0;
  }
  .Help:hover::after{
    background-image: url( '/images/menu/help_green.svg' );
  }
  </style>

  <div class="Switch"></div>

  <div class="Foot">
    <index-menu></index-menu>
  ${( () => {
    if( this.preMenuView === 'help' ) {
      return html`
    <div class="Help" @click="${this.openHelp}">${translations.help}</div>`;
    }

    if( this.preMenuView === 'switch' ) {
      return html`
    <c-switch @click="${this.switchClick}" .on="${this.switchOn}"></c-switch>`;
    }

    return '';
  })()}
  </div>`;
};
