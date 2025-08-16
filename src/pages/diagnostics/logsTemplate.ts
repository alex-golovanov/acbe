import internationalize from 'tools/internationalize';
import Logs from './logs';
import { html } from 'lit';
import { when } from 'lit/directives/when.js';


const translations: { [ key: string ]: string } = Object.fromEntries(
  Object.entries({
    'copyToClipboard': 'copy_to_clipboard',
    'hideHealthCheckLogs': 'hide_health_check_logs',
    'showHealthCheckLogs': 'show_health_check_logs',
  }).map( ( [ key, value ] ) => ( [ key, internationalize( value ) ] ) )
);


/** @method */
export default function( this: Logs )/*: string*/ {
  return html`
  <style>
  :host{
    display: block;
  }

  .Show{
    font-size: 14px;
    color: #1c304e;
    text-align: center;
    padding-bottom: 20px;
  }
  .Show > .In{
    position: relative;
    display:inline-block;vertical-align:top;
    padding: 0 24px;
  }
  .Show > .In::after{
    content: '';
    display: block;
    background: url( '/images/diagnostics.svg#document' ) 0 0 no-repeat;
    background-size: 100% 100%;
    width: 14px;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    padding-top:18px;
    position: absolute;
    top: calc(50% - 9px);
    left: 0;
  }
  .Show > .In > .In{
    display: inline;
    border-bottom: 1px dashed #8d97a6;
    cursor: pointer;
  }
  .Show > .In > .In:hover{
    border-bottom-color: transparent;
  }

  .Textarea textarea{
    display: block;
    box-sizing: border-box;
    background: #f7f7f7;
    border: 1px solid #cccccc;
    border-radius: 3px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    padding: 18px;
    overflow: auto;
    width: 100%;
    height: 370px;
    resize: vertical;
    color: #666;
  }

  .Button{
    padding-top: 30px;
    text-align: center;
  }
  .Button input[type="button"]{
    display: block;
    margin: 0 auto;
    border: 0;
    background: #1c304e;
    color: #fff;
    height: 40px;
    padding: 0 22px;
    font-size: 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  </style>

  <div class="Show">
    <div class="In">
      <div class="In" @click="${this.toggleLog}">
        ${this.visible ? translations.hideHealthCheckLogs : translations.showHealthCheckLogs}
      </div>
    </div>
  </div>

  ${when( this.visible, () => html`
    <div class="Textarea">
      <textarea
        name="logs"
        rows="8"
        cols="80"
        .value="${this.text}"
        readonly="readonly"
        spellcheck="false"></textarea>
    </div>
    <div class="Button">
      <input 
        type="button" 
        value="${translations.copyToClipboard}" 
        @click="${this.copy}"
      />
    </div>`
  )}
  `;
};
