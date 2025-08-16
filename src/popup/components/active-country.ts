import createTranslation from '../tools/createTranslationObject';
import globalStyle from './globalStyle';
import { LitElement, html } from 'lit';


const translations: { [ key: string ]: string } = createTranslation({
  'change': 'change'
});


/** @function */
const flagUrl = ( flag: string | void ): string => {
  if( flag === 'usw' ) flag = 'us';
  if( flag === 'uk' ) flag = 'gb';

  return flag ? `/images/flags/${flag}.svg` : '/images/empty.png';
};


class ActiveCountry extends LitElement {
  country: string;
  countryName: string;
  rating: number | undefined;

  static get properties() {
    return {
      'country': {
        'type': String
      },
      'countryName': {
        'type': String
      },
      'rating': {
        'type': Number
      },
    };
  }

  // Lifecycle
  constructor() {
    super();

    this.country = '';
    this.countryName = '';
  }

  render() {
    return html`
    <style>
    ${globalStyle}
    :host{
      display:block;
      cursor: pointer;
      border: 1px solid #bcbcbc;
      border-radius: 4px;
      text-align: justify;
      height: 58px;
      padding: 0 20px!important;
    }
    :host(:hover){
      background: #efefef;
    }
    :host > .In{
      display: table;
      height: 100%;
      width: 100%;
    }
    :host > .In > .E{
      display: table-cell;
      vertical-align: middle;
    }
    :host > .In > .E:first-child{
      width: 1px;
      padding-right: 12px;
    }
    :host > .In > .E:last-child{
      width: 1px;
    }
    img{
      display: block;
      border-radius: 4px;
      filter: saturate(135%);
      opacity:0.7;
      border: 1px solid rgba(0, 0, 0, 0.22);
    }
    .Active_Country_Name{
      font-size: 18px;
      text-align: left;
    }
  
    .ChangeButton{
      display:inline-block;
      vertical-align:top;
      font-size: 12px;
      border-radius: 4px;
      line-height: 18px;
      text-align: center;
      background: #fff;
      border: 1px solid #268328;
      color: #268328;
      padding: 0 8px;
    }
  
    .Rating{
      background: url( '/images/pings/1.svg' ) 0 0 no-repeat;
      background-size: 100% 100%;
      width: 23px;
      overflow:hidden;font-size:0;text-indent:-9999px;height:0;
      padding-top:12px;
      margin-left: auto;
      border-right: 15px solid transparent;
    }
    .Rating.r2{
      background-image: url( '/images/pings/2.svg' );
    }
    .Rating.r3{
      background-image: url( '/images/pings/3.svg' );
    }
    .Rating.r4{
      background-image: url( '/images/pings/4.svg' );
    }
    .Rating.r5{
      background-image: url( '/images/pings/5.svg' );
    }
    </style>
    
    <div class="In">
    ${( () => {
      if( !this.country ) return '';
      return html`
      <div class="E">
        <img src="${flagUrl( this.country )}" width="30" height="20" />
      </div>`;
    })()}
      <div class="E">
        <div class="Active_Country_Name">${this.countryName}</div>
      </div>
    ${( () => {
      if( !this.rating ) return '';
      return html`
      <div class="E">
        <div class="Rating r${this.rating}"></div>
      </div>`;
    })()}
      <div class="E"><div class="ChangeButton">${translations.change}</div></div>
    </div>`;
  }
};

customElements.define( 'active-country', ActiveCountry );
