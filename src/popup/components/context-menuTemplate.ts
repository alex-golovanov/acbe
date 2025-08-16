import createTranslation from '../tools/createTranslationObject';
import ContextMenu from './context-menu';
import globalStyle from './globalStyle';
import { html } from 'lit';


const translations: { [ key: string ]: string } = createTranslation({
  'help': 'help',
  'addSettingFor': 'add_smart_setting_for_X',
  'deleteSettingFor': 'delete_smart_setting_for_X',
  'editSmartSettings': 'edit_smart_settings'
});

/** @function */
const domainTextTranslation = (
  property: string,
  domain: string
): string => (
  translations[ property ].replace( /XXX/g, domain )
);


/** @method */
export default function( this: ContextMenu ) {
  return html`
  <style>
  ${globalStyle}
  :host{
    display: block;
    position: absolute;
    /*bottom: 40px;*/
    font-size: 12px;
    color: var( --brand-blue );
  }
  :host > .In{
    position: relative;
    border-radius: 3px;
    background: #fff;
    border: 1px solid #bcbcbc;
    box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.35);
  }

  .Element{
    padding: 0 12px;
    line-height: 34px;
    white-space: nowrap;
    cursor: pointer;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .Element:hover{
    background: var( --brand-blue );
    color: #fff;
  }
  .Element ~ .Element{
    border-top: 1px solid #e6e6e6;
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
  }
  .Element:last-child{
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
  }
  </style>

  <div class="In">
  ${( () => {
    if( !this.domain ) return '';

    if( !this.containsFilter ) {
      return html`
    <div class="Element" @click="${this.addFilter}">
      ${domainTextTranslation( 'addSettingFor', this.unicodeDomain )}
    </div>`;
    }

    return html`
    <div class="Element" @click="${this.removeFilter}">
      ${domainTextTranslation( 'deleteSettingFor', this.unicodeDomain )}
    </div>`;
  })()}

  ${( () => {
    if( !this.showEditSmartSettings ) return '';
    return html`
    <div class="Element" @click="${this.editSettings}">${
      translations.editSmartSettings
   }</div>`;
  })()}
    <div class="Element" @click="${this.openHelp}">${
      translations.help
   }</div>
  </div>`;
};
