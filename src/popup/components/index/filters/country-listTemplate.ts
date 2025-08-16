import createTranslation from '../../../tools/createTranslationObject';
import FiltersCountryList from './country-list';
import globalStyle from '../../globalStyle';
import { html } from 'lit';


const translations: { [ key: string ]: string } = createTranslation({
  'browsecOff': 'browsec_off',
  'off': 'off'
});


/** @function */
const flagUrl = ( flag: string | undefined ): string => {
  if( flag === 'usw' ) flag = 'us';
  if( flag === 'uk' ) flag = 'gb';

  return flag ? `/images/flags/${flag}.svg` : '/images/empty.png';
};


/** @method */
export default function( this: FiltersCountryList ) {
  const sortedCountries = [...this.countries];

  const getMarkClass = (country: { 'code': string, 'mark'?: number | undefined }): string => {
    if (!country.mark && this.recommendedCountries.includes(country.code)) {
      return 'mark5';
    }

    if (!country.mark && this.pingInProcess) {
      return 'mark-process';
    }

    if (country.mark) {
      return `mark${country.mark}`;
    }

    return 'mark1';
  };

  sortedCountries.sort((a, b) => {
    if (!a.mark && !b.mark) {
      if (this.recommendedCountries.includes(a.code) && !this.recommendedCountries.includes(b.code)) {
        return -1;
      } else if (!this.recommendedCountries.includes(a.code) && this.recommendedCountries.includes(b.code)) {
        return 1;
      }
    }

    if (a.mark === b.mark) return a.name.localeCompare(b.name);

    if (!a.mark) {
      return 1;
    } else if (!b.mark) {
      return -1;
    }

    return b.mark - a.mark;
  });

  return html`
  <style>
  ${globalStyle}
  :host{
    display: block;
    overflow: auto;
    position: absolute;
    background: #fff;
    border: 1px solid #bcbcbc;
    padding: 4px 0;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
  }

  .E{
    padding: 4px 10px;
    cursor: pointer;
    user-select: none;
  }
  .E.highlighted{
    background: #f5f5f5;
  }
  .E > .In{
    display: table;
    width: 100%;
  }

  .Name{
    display: table-cell;
    vertical-align: middle;
  }
  .MarkTD{
    display: table-cell;
    vertical-align: middle;
    padding-left: 10px;
    width: 1px;
  }
  .Flag{
    display: table-cell;
    vertical-align: middle;
    padding-left: 10px;
    width: 1px;
  }
  .Flag img{
    display: block;
    border-radius: 4px;
    filter: saturate(135%);
    opacity:0.7;
    border: 1px solid rgba(0, 0, 0, 0.22);
  }
  .Flag_Off{
    width: ${this.language === 'en' ? '30' : '39'}px;
    line-height: 20px;
    font-size: 14px;
    color: var( --brand-burgundy );
    text-align: center;
  }

  .Off{
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid #cccccc;
  }

  .Mark{
    display: block;
    width: 23px;
    overflow:hidden;
    font-size:0;
    text-indent:-9999px;
    height:0;
    padding-top: 12px;
    background: url( '/images/pings/1.svg' ) 0 0 no-repeat;
    background-size: 100% 100%;
    margin-top: -1px;
  }
  .Mark.mark1{
    background-image: url( '/images/pings/1.svg' );
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

  .Mark.mark-process {
    animation: ping 1s infinite;
  }

  @keyframes ping {
    0% { background-image: url( '/images/pings/1.svg' ); }
    20% { background-image: url( '/images/pings/2.svg' ); }
    40% { background-image: url( '/images/pings/3.svg' ); }
    60% { background-image: url( '/images/pings/4.svg' ); }
    80% { background-image: url( '/images/pings/5.svg' ); }
  }
  </style>

  <div class="Off">
    <div
      class="E${this.country === null ? ' highlighted' : ''}"
      @click="${this.offClick}"
      @mousemove="${this.elementHighlight( null )}">
      <div class="In">
        <div class="Name">${translations.browsecOff}</div>
        <div class="Flag"><div class="Flag_Off">${translations.off}</div></div>
      </div>
    </div>
  </div>
  ${sortedCountries.map( item => html`
    <div
      class="E${this.country === item.code ? ' highlighted' : ''}"
      @click="${this.elementClick( item.code )}"
      @mousemove="${this.elementHighlight( item.code )}">
      <div class="In">
        <div class="Name">${item.name}</div>
        <div class="MarkTD">${( () => {
          return html`
            <div class="Mark ${getMarkClass( item )}"></div>`;
          })()}</div>
        <div class="Flag">
          <img src="${flagUrl( item.code )}" width="30" height="20" alt=""/>
        </div>
      </div>
    </div>`
  )}`;
};
