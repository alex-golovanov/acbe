/* global NodeListOf */
import render from './blockTemplate';
import slide from './slide';
import { LitElement, PropertyValues } from 'lit';

const { _ } = self;


class MainBlock extends LitElement {
  freeze: boolean;

  render() {
    return render.call( this );
  }
  static get properties() {
    return {
      'freeze': { 'type': Boolean }
    };
  }

  // Lifecycle
  constructor() {
    super();

    this.freeze = false;
  }

  /** @method */
  firstUpdated( changedProperties: PropertyValues<any> ) {
    super.firstUpdated( changedProperties );

    { // All nodes with image replacement
      const list =
        this.shadowRoot?.querySelectorAll?.( '[data-role="with image"]' ) as NodeListOf<HTMLElement>;
      list.forEach( element => {
        const text: string = ( element.textContent as string ).trim();

        const parts/*: Array<Array<Node>>*/ = text.split( 'IMG' ).map(
          ( text, index ) => {
            if( !index ) return [ document.createTextNode( text ) ];

            const img/*: HTMLElement*/ = document.createElement( 'img' );
            Object.entries({
              'src': '/images/help/plus.svg',
              'width': '23',
              'height': '13',
              'alt': ''
            }).forEach( ( [ attribute/*: string*/, value/*: string*/ ] ) => {
              img.setAttribute( attribute, value );
            });

            return [ img, document.createTextNode( text ) ];
          }
        );

        let nodes/*: Node[]*/ = _.flatten( parts );

        // Removing all nodes inside element
        Array.from( element.childNodes ).forEach( node => {
          element.removeChild( node );
        });
        nodes.forEach( node => {
          element.appendChild( node );
        });
      });
    }

    const objects: Array<{
      'elements': {
        'information': HTMLElement,
        'parent': HTMLElement,
        'trigger': HTMLElement
      },
      'visible': boolean
    }> = [];
    const list =
      this.shadowRoot?.querySelectorAll?.( '[data-role="section"]' ) as NodeListOf<HTMLElement>;
    list.forEach( ( element, index ) => {
      const information =
        element.querySelector( 'div.Section_Information' ) as ( HTMLElement | null );
      const trigger =
        element.querySelector( '[data-click="trigger"]' ) as ( HTMLElement | null );
      if( !information ) {
        throw new Error( 'No information element in unblock-proxy' );
      }
      if( !trigger ) {
        throw new Error( 'No trigger element in unblock-proxy' );
      }

      objects.push({
        'elements': { 'parent': element, trigger, information },
        'visible': false
      });
    });
    const indexes: integer[] = objects.map( ( x, index ) => index );

    objects.forEach( ( currentObject, index ) => {
      const { elements } = currentObject;

      elements.trigger.addEventListener( 'click', async() => {
        if( this.freeze ) return;

        this.freeze = true;

        const otherIndexes: integer[] = _.without( indexes, index ).filter(
          index => objects[ index ].visible
        );
        let promises/*: Array<Promise<any>>*/ = otherIndexes.map(
          async index => {
            const { elements } = objects[ index ];

            elements.information.style.cssText = 'display:block;overflow:hidden';
            
            const style = getComputedStyle( elements.information );
            const animation = elements.information.animate(
              [
                {
                  'height': style.getPropertyValue( 'height' ),
                  'paddingTop': style.getPropertyValue( 'padding-top' ),
                  'paddingBottom': style.getPropertyValue( 'padding-bottom' )
                },
                {
                  'height': 0,
                  'paddingTop': 0,
                  'paddingBottom': 0
                }
              ],
              //{
              //  'height': ( [ style.getPropertyValue( 'height' ), 0 ] /*: Array<number | null>*/ ),
              //  'paddingTop': ( [ style.getPropertyValue( 'padding-top' ), 0 ] /*: Array<number | null>*/ ),
              //  'paddingBottom': ( [ style.getPropertyValue( 'padding-bottom' ), 0 ] /*: Array<number | null>*/ )
              //},
              {
                'duration': 700,
                'easing': 'linear'
              }
            );
            await new Promise( resolve => { animation.onfinish = resolve; });
            
            elements.parent.classList.remove( 'open' );
            elements.information.style.cssText = '';
            objects[ index ].visible = false;
          }
        );

        promises.push( ( async() => {
          const animation = slide(
            elements.information,
            currentObject.visible ? 'up' : 'down',
            {
              'duration': 700,
              'easing': 'linear'
            }
          );
          await new Promise( resolve => { animation.onfinish = resolve; });

          if( currentObject.visible ) {
            elements.parent.classList.remove( 'open' );
          }
          else {
            elements.parent.classList.add( 'open' );
          }

          elements.information.style.cssText = '';
          currentObject.visible = !currentObject.visible;
        })() );

        await Promise.all( promises );

        this.freeze = false;
      });
    });
  }
};
customElements.define( 'main-block', MainBlock );


export default MainBlock;
