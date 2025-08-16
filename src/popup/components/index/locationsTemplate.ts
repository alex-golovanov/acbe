/* global LocationsRenderServerData */
import createTranslation from '../../tools/createTranslationObject';
import computeMode from './locations/computeMode';
import getScrollbarStyle from '../../tools/getScrollbarStyle';
import globalStyle from '../globalStyle';
import IndexLocations from './locations';
import { html } from 'lit';
import internationalize from 'tools/internationalize';

type HighlightedCountry = {
  'code': string,
  'premium': boolean
};

const translations: { [ key: string ]: string } = createTranslation({
  'back': 'back',
  'virtualLocations': 'virtual_locations',
  'serversInVirtualLocations': 'N_servers_in_N_virtual_Locations'
});

/** @function */
const computeHighlighted = (
  item: LocationsRenderServerData,
  highlightedCountry: HighlightedCountry | null
): boolean => Boolean(
  highlightedCountry
  && highlightedCountry.code === item.code
  && highlightedCountry.premium === item.premium
);

/** @method */
export default function( this: IndexLocations ) {
  const premiumCountriesCount = this.countries.filter( ({ premium }) => premium )?.length || 0;
  const serversInVirtualLocations = internationalize( 'N_servers_in_N_virtual_Locations', [ '600', premiumCountriesCount.toString() ] );

  const sortedCountries = [...this.countries];

  sortedCountries.sort( ( a, b ) => {
    if( b.favorited && !a.favorited ) {
      return 1;
    }

    if (!this.premiumUser && a.premium && !b.premium) {
      return 1;
    }

    if (!a.mark && !b.mark && !!this.premiumUser === !!a.premium) {
      if( this.recommendedCountries.includes(a.code) && !this.recommendedCountries.includes(b.code) ) {
        return -1;
      } else if( !this.recommendedCountries.includes(a.code) && this.recommendedCountries.includes(b.code) ) {
        return 1;
      }
    }

    if( a.mark === b.mark ) return a.name.localeCompare( b.name );

    if ( !a.mark ) {
      return 1;
    } else if( !b.mark ) {
      return -1;
    }

    return b.mark - a.mark;
  });

  return html`
  <style>
    ${globalStyle}
    :host > .In{
      overflow: auto;
      height: 100%;
    }
    ${getScrollbarStyle( ':host > .In' )}

    .Head{
      display: flex;
      flex-wrap: wrap;
      padding: 11px 12px;
      text-align: center;
      position: relative;
    }
    .Head > .T{
      flex-grow: 0;
      flex-shrink: 0;
      margin: 0 auto;
      position: relative;
    }
    .Head_Title{
      font-size: 20px;
      font-weight: 600;
      line-height: 1.2;
    }
    .ServerCount{
      flex-grow: 0;
      flex-shrink: 0;
      width: 100%;
      font-size: 12px;
      line-height: 1.25;
      padding-top: 2px;
    }

    .Back{
      position: absolute;
      left: 12px;
      top: 16px;
      font-size: 14px;
      line-height: 1.2;
      padding: 0 0 0 18px;
      cursor: pointer;
    }
    .Back::before{
      content: '';
      display: block;
      background: url('/images/arrow_left.svg') 0 0 no-repeat;
      background-size: 100% 100%;
      width: 9px;
      overflow:hidden;font-size:0;text-indent:-9999px;height:0;
      padding-top: 16px;
      position: absolute;
      left: 0;
      top: calc(50% - 8px);
    }

    .Helper{
      position: absolute;
      left: calc(100% + 5px);
      top: calc(50% - 8px);
      background: url( '/images/information_grey.svg' ) 0 0 no-repeat;
      background-size: 100% 100%;
      width: 16px;
      overflow:hidden;font-size:0;text-indent:-9999px;height:0;
      padding-top: 16px;
      cursor: pointer;
      text-align: left;
    }
    .Helper:hover{
      background-image: url( '/images/information_green.svg' );
    }
    .Helper::after{
      content: '';
      display: block;
      background: url( '/images/information_green.svg' ) 0 -5000px no-repeat;
      width: 1px;
      height: 1px;
      overflow: hidden;
      position: absolute;
      left: 0;
      top: 0;
    }

    .MissingLocation{
      color: var( --brand-green );
      padding: 5px 0 0;
      font-size: 13px;
    }
    .MissingLocation a{
      color: var( --brand-green );
      text-decoration: none;
      border-bottom: 1px solid var( --brand-green );
    }
    .MissingLocation a:hover{
      border-bottom-color: transparent;
    }

    .Sections{
      padding: 0px 12px 12px;
    }

    .SortButtons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin: 6px 0;
    }

    .SortButtons button {
      padding: 4px 10px;
      cursor: pointer;
      color: #7a7c7f;
      border: none;
      background: none;
    }

    .SortButtons button.active {
      color: var(--brand-green);
    }
  </style>

  <div class="In">
    <div class="Head">
      <div class="Back" @click="${this.back}">${translations.back}</div>
      <div class="T">
        <div class="Head_Title">${translations.virtualLocations}</div>
        <div class="Helper" @click="${this.openHelp}">?</div>
      </div>
      <div class="ServerCount">${serversInVirtualLocations}</div>
    </div>

    <div class="Sections">
      ${sortedCountries.map( item => (
        html`<index-locations-element
          @countryclick="${this.countryClick}"
          @favorite="${this.favorite}"
          @mousemove="${this.elementHighlight(item)}"
          .data="${item}"
          .highlighted="${computeHighlighted(item, this.highlightedCountry)}"
          .mode="${computeMode(item, this.premiumUser, this.country)}"
          .pingInProcess="${this.pingInProcess}"
          .isRecommended="${!!this.premiumUser === !!item.premium && this.recommendedCountries.includes( item.code )}"
        ></index-locations-element>`
      ))}
    </div>
  </div>`;
};
