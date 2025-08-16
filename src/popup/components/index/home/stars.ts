import globalStyle from '../../globalStyle';
import { html, LitElement, PropertyValues } from 'lit';
import internationalize from 'tools/internationalize';

const translations: { [key: string]: string } = Object.fromEntries(
  Object.entries({
    'starsRateUs': 'stars_rate_us', // ${language === 'ru' ? 'Оцените нас' : 'Rate us'}
  }).map( ( [ key, value ] ) => [ key, internationalize( value ) ] ),
);

class IndexHomeStars extends LitElement {
  render() {
    return html` <style>
        ${globalStyle} :host {
          display: block;
        }

        .Text {
          text-align: center;
          padding: 0 0 20px;
          font-weight: 600;
          font-size: 18px;
        }

        .Stars {
          padding: 0 0 26px;
        }
        .Stars > .In {
          width: 245px;
          margin: 0 auto;
          position: relative;
          display: flex;
        }
        .Stars > .In::before {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 41px;
          background: url('/images/star.svg#empty') 0 0 no-repeat,
            url('/images/star.svg#empty') 50px 0 no-repeat,
            url('/images/star.svg#empty') 100px 0 no-repeat,
            url('/images/star.svg#empty') 150px 0 no-repeat,
            url('/images/star.svg#empty') 200px 0 no-repeat;
          background-size: 44px 41px, 44px 41px, 44px 41px, 44px 41px, 44px 41px;
        }
        .Stars > .In > .E {
          flex-grow: 0;
          width: 44px;
          height: 41px;
          position: relative;
          cursor: pointer;
        }
        .Stars > .In > .E::after {
          content: '';
          display: none;
          position: absolute;
          top: 0;
          left: 0;
          width: 44px;
          height: 41px;
          background: url('/images/star.svg#filled') 0 0 no-repeat;
          background-size: 44px 41px;
        }
        .Stars > .In > .E.active::after {
          display: block;
        }
        .Stars > .In > .E ~ .E {
          margin-left: 6px;
        }
      </style>

      <div class="Text">${translations.starsRateUs}</div>
      <div class="Stars">
        <div class="In">
          <div class="E active"></div>
          <div class="E active"></div>
          <div class="E active"></div>
          <div class="E active"></div>
          <div class="E active"></div>
        </div>
      </div>`;
  }

  /** @method */
  async firstUpdated( changedProperties: PropertyValues<any> ) {
    super.firstUpdated( changedProperties );

    ( () => {
      const parent = this.shadowRoot?.querySelector?.( '.Stars > .In' );
      if( !parent ) return;

      let state = 4;

      let index = 0;
      const elements = Array.from( parent.children );
      for( const element of elements ) {
        const elementIndex = index;

        element.addEventListener( 'mouseover', () => {
          if( state === elementIndex ) return;

          elements.slice( 0, elementIndex + 1 ).forEach( ( element ) => {
            element.classList.add( 'active' );
          });
          elements.slice( elementIndex + 1 ).forEach( ( element ) => {
            element.classList.remove( 'active' );
          });

          state = index;
        });

        element.addEventListener( 'click', () => {
          this.dispatchEvent(
            new CustomEvent( 'choose', { 'detail': elementIndex + 1 }),
          );
        });

        index++;
      }

      // When user leaves stars - put 5 stars back
      parent.addEventListener( 'mouseleave', () => {
        state = 4;

        for( const element of elements ) element.classList.add( 'active' );
      });
    })();
  }
}
customElements.define( 'index-home-stars', IndexHomeStars );
