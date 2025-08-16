/* global StoreState */

import CharsBuffer from 'tools/CharsBuffer';
import render from './country-listTemplate';
import { connect } from 'pwa-helpers/connect-mixin';
import store from 'store';
import { LitElement } from 'lit';


type NameListItem = {
  'code': string | null,
  'element': HTMLElement,
  'name': string,
};


class FiltersCountryList extends connect( store )( LitElement ) { // @ts-ignore
  charsBuffer: CharsBuffer;
  countries: Array<{
    'code': string,
    'mark'?: integer | undefined,
    'name': string
  }>;
  country: string | null;
  language: string; // @ts-ignore
  namesList: NameListItem[];
  recommendedCountries: string[];
  pingInProcess: boolean;

  render() {
    return render.call( this );
  }
  static get properties() {
    return {
      'countries': { 'type': Array },
      'country': { 'type': String }
    };
  }

  // Lifecycle
  constructor() {
    super();
    this.keydownListener = this.keydownListener.bind( this );

    this.countries = [];
    this.country = null;
    this.recommendedCountries = [];
    this.pingInProcess = false;

    // @ts-ignore
    this.language = window.language as string;
  }

  /** @method */
  connectedCallback() {
    super.connectedCallback();

    this.charsBuffer = new CharsBuffer();
    document.addEventListener( 'keydown', this.keydownListener );
  }

  /** @method */
  stateChanged(state: StoreState): void {
    const { user, recommendedCountries, pingInProcess } = state;

    this.recommendedCountries = user.premium ? recommendedCountries.premium : recommendedCountries.free;
    this.pingInProcess = pingInProcess;
  }

  /** @method */
  firstUpdated() {
    let namesData = this.countries.map(
      ({ code, name }) => ({ code, 'name': name.toLowerCase() })
    );

    const collection = this.shadowRoot?.children as HTMLCollection;
    const elements: HTMLElement[] = [];
    for( const element of collection ) { // Exclude 'style'
      if( element.tagName.toLowerCase() !== 'div' ) continue;
      elements.push( element as HTMLElement );
    }

    this.namesList = elements.slice( 1 ).map( ( element, index ) => {
      let { code, name } = namesData[ index ];
      return { element, code, name };
    });

    // Add OFF element
    this.namesList.unshift({
      'code': null,
      'element': this.shadowRoot?.querySelector?.( 'div.Off > div.E' ) as HTMLElement,
      'name': 'OFF'
    });

    this.charsBuffer.addListener( word => {
      const match/*: NameListItem | void*/ = this.namesList.find(
        ({ code, name }) => code && name.startsWith( word )
      );
      if( !match ) return;

      const { element, code } = match;

      this.country = code;

      // Scroll to this element
      this.scrollTop = element.offsetTop - 2;
    });
  }

  /** @method */
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener( 'keydown', this.keydownListener );
  }

  // Methods
  /** @method */
  elementClick( country: string ) {
    return () => {
      this.dispatchEvent( new CustomEvent( 'select', { 'detail': country }) );
      this.remove();
    };
  }

  /** @method */
  elementHighlight( country: string | null )/*: Function*/ {
    return ( event: MouseEvent ) => {
      let mouseReallyMoved = Boolean( event.movementX || event.movementY );
      if( mouseReallyMoved ) this.country = country;
    };
  }

  /** @method */
  keydownListener( event: KeyboardEvent )/*: void*/ {
    let { key } = event;
    if( key === 'ArrowDown' || key === 'ArrowUp' ) {
      event.preventDefault();

      let newHighlightedIndex: integer = ( () => {
        let length/*: integer*/ = this.namesList.length;

        let index/*: integer*/ = this.namesList.findIndex(
          ({ code }) => code === this.country
        );
        index += key === 'ArrowDown' ? 1 : -1;

        return ( index + length ) % length;
      })();

      let data/*: NameListItem*/ = this.namesList[ newHighlightedIndex ];

      this.country = data.code;

      // Scroll whole list if new item is partially or not visible
      let topEdge/*: number*/ = this.scrollTop;
      let screenHeight/*: number*/ = this.offsetHeight;
      let bottomEdge/*: number*/ = topEdge + screenHeight;
      let newElementHeight/*: number*/ = data.element.offsetHeight;
      let newElementTopEdge/*: number*/ = data.element.offsetTop;
      let newElementBottomEdge/*: number*/ = newElementTopEdge + newElementHeight;

      let visible/*: boolean*/ =
        newElementTopEdge >= topEdge && newElementBottomEdge <= bottomEdge;
      if( visible ) return;

      let scrollTop/*: number*/ = ( () => {
        // Hidden item at bottom
        if( newElementTopEdge >= topEdge ) {
          return newElementBottomEdge - screenHeight + 2;
        }

        // Hidden item at top
        return newElementTopEdge - 2;
      })();
      this.scrollTop = scrollTop;
      return;
    }
    if( key === 'Enter' ) {
      if( this.country ) {
        this.dispatchEvent(
          new CustomEvent( 'select', { 'detail': this.country })
        );
      }
      else this.dispatchEvent( new CustomEvent( 'disable' ) );

      this.remove();
      return;
    }

    this.charsBuffer.keydownListener( event );
  }

  /** @method */
  offClick()/*: void*/ {
    this.dispatchEvent( new CustomEvent( 'disable' ) );
    this.remove();
  }
};
customElements.define( 'filters-country-list', FiltersCountryList );


export default FiltersCountryList;
