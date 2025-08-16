/* global LocationsRenderServerData, LitUpdatedChanges */
import render from './elementTemplate';
import { LitElement } from 'lit';


class IndexLocationsElement extends LitElement {
  data: LocationsRenderServerData;
  highlighted: boolean;
  mode: string;
  pingInProcess: boolean;
  isRecommended: boolean;

  render() {
    return render.call( this );
  }
  static get properties() {
    return {
      'data': {
        'type': Object
      },
      'highlighted': {
        'type': Boolean
      },
      'mode': { // Key property
        'type': String
      },
      'pingInProcess': {
        'type': Boolean
      },
      'isRecommended': {
        'type': Boolean
      }
    };
  }

  // Lifecycle
  constructor() {
    super();

    // @ts-ignore
    this.data = {};
    this.highlighted = false;
    this.mode = '';
    this.pingInProcess = false;
    this.isRecommended = false;
  }

  /** @mathod */
  // @ts-ignore
  updated( changes: LitUpdatedChanges<IndexLocationsElement> ) {
    if( changes.has( 'highlighted' ) ) {
      let newState/*: boolean*/ = this.highlighted;
      let oldState/*: boolean | void*/ = changes.get( 'highlighted' );

      if( newState !== oldState ) {
        this.classList.toggle( 'highlight', newState );
      }
    }

    if( changes.has( 'mode' ) ) {
      this.classList.toggle( 'current', this.mode === 'current' );
      this.classList.toggle( 'premium', this.mode === 'premium' );
    }
  }

  // Methods
  /** @method */
  favoritesClick()/*: void*/ {
    this.dispatchEvent( new CustomEvent( 'favorite', {
      'detail': {
        'country': this.data.code,
        'favorited': !this.data.favorited
      }
    }) );
  }

  /** @method */
  fullElementClick( event: MouseEvent ): void {
    const favoritesClick/*: boolean*/ =
      event.target instanceof HTMLElement
      && event.target.classList.contains( 'Favorite' );
    if( this.mode === 'current' || favoritesClick ) return;

    this.dispatchEvent( new CustomEvent(
      'countryclick',
      { 'detail': { 'mode': this.mode, 'country': this.data.code } }
    ) );
  }
};
customElements.define( 'index-locations-element', IndexLocationsElement );


export default IndexLocationsElement;
