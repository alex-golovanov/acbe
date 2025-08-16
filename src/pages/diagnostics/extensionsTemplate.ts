import Extensions from './extensions';
import globalStyle from './globalStyle';
import internationalize from 'tools/internationalize';
import { html } from 'lit';


const disableTranslation = internationalize( 'disable' );


/** @method */
export default function( this: Extensions ) {
  return html`
  <style>
  ${globalStyle}
  :host{
    display: block;
  }

  input[type="checkbox"]{
    display: block;
    width: 15px;
    height: 15px;
    -moz-appearance: none;
    -webkit-appearance: none;
    background: url( '/images/checkbox.svg#unchecked' ) 0 0 no-repeat;
    background-size: 100% 100%;
    border: 0;
  }
  input[type="checkbox"]:checked{
    background-image: url( '/images/checkbox.svg#checked' );
  }

  .List > table{
    border-collapse: collapse;
    font-size: 14px;
  }
  .List > table > tbody > tr > td ~ td{
    padding-left: 12px;
  }
  .List > table > tbody > tr ~ tr > td{
    padding-top: 10px;
  }

  .List img,
  .Name{
    cursor: default;
  }

  .Icon{
    width:36px;
    height:36px;
    border:1px solid #888;
    border-radius: 50%;
  }

  .Disable{
    padding-top: 15px;
  }
  .Disable input{
    display: block;
    padding: 0 32px;
    height: 36px;
    font-size: 16px;
    background: var( --brand-green );
    border-radius: 4px;
    cursor: pointer;
    border: 0;
    color: #fff;
  }
  </style>

  <div class="List"><table><tbody>
  ${this.views.map( ( item, index ) => (
    html`
    <tr>
      <td>
        <input
          type="checkbox"
          id="${item.id}"
          ?checked="${item.checked}"
          @click="${this.clickCheckbox( index )}" />
      </td>
      <td>
        ${( () => {
      if( !item.icon ) return '';
      if( typeof browser !== 'undefined' ) { // Firefox no support for img-src moz-extension:
        return html`
        <div class="Icon"></div>`;
      }
      return html`
        <img
          src="${item.icon}"
          width="38"
          height="38"
          alt=""
          @click="${this.clickCheckbox( index )}"/>`;
    })()}
      </td>
      <td><span class="Name" @click="${this.clickCheckbox( index )}">${item.name}</span></td>
    </tr>`
  ) )}
  </tbody></table></div>
  ${( () => {
    // Firefox has no support for management.setEnabled
    if( typeof browser !== 'undefined' ) return '';

    return html`
  <div class="Disable">
    <input 
      type="button" 
      value="${disableTranslation}" 
      @click="${this.disableExtensions}"
    />
  </div>`;
  })()}`;
};
