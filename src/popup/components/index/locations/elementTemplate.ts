// data-mark and data-favorited to fix bug in old Chrome/FF rendering
import globalStyle from '../../globalStyle';
import IndexLocationsElement from './element';
import { html } from 'lit';


/** @function */
const flagUrl = ( flag?: string ): string => {
  if( flag === 'usw' ) flag = 'us';
  if( flag === 'uk' ) flag = 'gb';

  return flag ? `/images/flags/${flag}.svg` : '/images/empty.png';
};


/** @method */
export default function( this: IndexLocationsElement ) {
  const getMarkClass = (): string => {
    if( this.isRecommended && !this.data.mark ) {
      return 'mark5';
    }

    if( !this.data.mark && this.pingInProcess ) {
      return 'mark-process';
    }

    if( this.data.mark ) {
      return `mark${this.data.mark}`;
    }

    return 'mark1';
  };

  return html`
  <style>
  ${globalStyle}
  :host{
    display: block;
    padding: 0 7px 0 10px;
    cursor: pointer;
    border: 1px solid transparent;
    border-radius: 4px;
  }
  :host(.highlight){
    background: #f7f8fc;
  }
  :host(.current){
    cursor: default;
  }
  :host(.current),
  :host(.current.highlight){
    background: #f0f5f0;
  }

  :host > .In{
    display: flex;
    align-items: center;
    height: 40px;
    background: url( '/images/favorites/hovered.svg' ) 0 -5000px no-repeat;
  }
  :host > .In > .E:first-child{
    width: 32px;
    padding: 0 10px 0 0;
    flex-shrink: 0;
    flex-grow: 0;
  }
  :host > .In > .E.country{
    padding-right: 5px;
    flex-grow: 1;
  }
  :host > .In > .E.mark{
    width: 23px;
    padding-left: 10px;
    flex-shrink: 0;
    flex-grow: 0;
  }
  :host > .In > .E.favorite{
    width: 19px;
    padding-left: 10px;
    flex-shrink: 0;
    flex-grow: 0;
  }

  .Flag{
    display: block;
    border-radius: 4px;
    filter: saturate(135%);
    opacity:0.7;
    border: 1px solid rgba(0, 0, 0, 0.22);
  }
  .Country{
    font-size: 13px;
    line-height: 1.2;
    color: #333;
  }

  .Favorite{
    background: url( '/images/favorites/static.svg' ) 0 0 no-repeat;
    background-size: 100% 100%;
    width: 13px;
    overflow:hidden;font-size:0;text-indent:-9999px;height:0;
    padding-top: 12px;
    cursor: pointer;
    border: 3px solid transparent;
  }
  .Favorite:hover{
    background-image: url( '/images/favorites/hovered.svg' );
  }
  .Favorite.favorited,
  .Favorite.favorited:hover{
    background-image: url( '/images/favorites/starred.svg' );
  }

  .Mark{
    width: 23px;
    overflow:hidden;
    font-size:0;
    text-indent:-9999px;
    height:0;
    padding-top: 12px;
    background: url( '/images/pings/1.svg' ) 0 0 no-repeat;
    background-size: 100% 100%;
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

  <div class="In" @click="${this.fullElementClick}">
    <div class="E">
      <img class="Flag" src="${flagUrl( this.data.code )}" width="30" height="20"/>
    </div>
    <div class="E country">
      <div class="Country">${this.data.name}</div>
    </div>
    ${( () => {
      return html`
        <div class="E mark">
          <div class="Mark ${getMarkClass()}">${this.data.mark}</div>
        </div>
      `;
    })()}
  ${( () => {
    if( typeof this.data.favorited !== 'boolean' ) return '';
    return html`
    <div class="E favorite">
      <div
        class="Favorite${this.data.favorited ? ' favorited' : ''}"
        @click="${this.favoritesClick}"></div>
    </div>`;
  })()}
  </div>`;
};
