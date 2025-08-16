import Summary from './summary';
import internationalize from 'tools/internationalize';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

const { _ } = self;

/** @method */
export default function( this: Summary ) {
  return html`
  <style>
  :host{
    display: block;
    font-size: 16px;
  }

  .Success,
  .Warning,
  .Error{
    display: none;
    text-align: center;
  }

  .Success::before,
  .Warning::before,
  .Error::before{
    content: '';
    display: block;
    background: url( '/images/diagnostics.svg#success' ) 0 0 no-repeat;
    background-size: 100% 100%;
    /*background: url('/images/diagnostics/state_icons_big.png') 0 0 no-repeat;*/
    width: 60px;
    overflow:hidden;font-size:0;text-indent:-9999px;
    height:0;
    padding-top:60px;
    margin: 0 auto;
    border-bottom: 20px solid transparent;
    text-align: left;
  }
  .Warning::before{
    background-image: url( '/images/diagnostics.svg#warning' );
  }
  .Error::before{
    background-image: url( '/images/diagnostics.svg#failed' );
  }

  .Success{
    color: var( --brand-green );
  }
  .Warning{
    color: #d8ad00;
  }
  .Error{
    color: #c0392b;
  }

  :host(.success) .Success{
    display: block;
  }
  :host(.warning) .Warning{
    display: block;
  }
  :host(.error) .Error{
    display: block;
  }
  </style>

  ${( () => {
    if( this.fixable ) {
      return html`
        <div class="Fixable ${_.upperFirst(this.ownState)}">
          ${unsafeHTML(internationalize('diagnostic_summury_fixable'))}
        </div>
      `;
    }

    if( this.blockedByAntivirus ) {
      return html`
        <div class="Fixable ${_.upperFirst(this.ownState)}">
          ${unsafeHTML(internationalize('diagnostic_summury_antivirus'))}
        </div>
      `;
    }

    return html`
      <div class="Success">
        ${unsafeHTML(internationalize('diagnostic_summury_success'))}
      </div>

      <div class="Warning">
        ${unsafeHTML(internationalize('diagnostic_summury_warning'))}
      </div>

      <div class="Error">
        ${unsafeHTML(internationalize('diagnostic_summury_error'))}
      </div>
    `;
    })()}`;
};
