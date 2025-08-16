import internationalize from 'tools/internationalize';
import StepState from './stepState';
import { html } from 'lit';


/** @function */
const text = ( state: string, language: string ): string => {
  switch( state ) {
    case 'skip': return internationalize( 'skipped' );
    case 'in process': return internationalize( 'running' );

    case 'success': return internationalize( 'completed' );
    case 'warning': return internationalize( 'warning' );
    case 'error': return internationalize( 'failed' );
    default: return '';
  }
};


/** @method */
export default function( this: StepState )/*: string*/ {
  // @ts-ignore
  const language = window.language as string;

  return html`
  <style>
  :host{
    display: flex;
    width: 140px;
  }

  .Text{
    display: table;
    flex-grow: 0;
    flex-shrink: 0;
    width: 100px;
    height: 30px;
    text-align: right;
    font-size: 12px;
  }
  :host(.skip) .Text{
    color: #999999;
  }
  :host(.progress) .Text{
    color: #1c2f4f;
  }
  :host(.success) .Text{
    color: #3b983f;
  }
  :host(.warning) .Text{
    color: #d8ae04;
  }
  :host(.error) .Text{
    color: #c0362b;
  }
  .Text > .In{
    display: table-cell;
    vertical-align: middle;
    padding-right: 17px;
  }

  .Icon{
    flex-grow: 0;
    flex-shrink: 0;
    width: 30px;
    padding-top:30px;
    overflow:hidden;
    font-size:0;
    text-indent:-9999px;
    height:0;
    background: url( '/images/diagnostics.svg#not_started' ) 0 0 no-repeat;
    background-size: 100% 100%;
    position: relative;
    z-index: 2;
  }
  :host(.skip) .Icon{
    background-image: url( '/images/diagnostics.svg#skipped' );
  }
  :host(.progress) .Icon{
    background-image: url( '/images/diagnostics.svg#waiting' );
  }
  :host(.success) .Icon{
    background-image: url( '/images/diagnostics.svg#success' );
  }
  :host(.warning) .Icon{
    background-image: url( '/images/diagnostics.svg#warning' );
  }
  :host(.error) .Icon{
    background-image: url( '/images/diagnostics.svg#failed' );
  }
  </style>
  
  <div class="Text"><div class="In">${text( this.state, language )} ${this.completion}</div></div>
  <div class="Icon">&nbsp;</div>`;
};
