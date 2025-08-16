/* global StoreState */
import globalStyle from './globalStyle';
import store from 'store';
import { connect } from 'pwa-helpers/connect-mixin';
import './login';
import './main-index';

import { html, render } from 'lit/html.js';


class PageSwitch extends connect( store as any )( HTMLElement ) {
  animation: boolean;
  animationObject?: Animation;
  indexPage: boolean;
  ribbon: HTMLElement;

  // Lifecycle
  constructor() {
    super();

    this.animation = false;
    this.indexPage = store.getStateSync().page.split( ':' )[ 0 ] === 'index'; // Right now always true

    const shadowRoot = this.attachShadow({ 'mode': 'open' });

    const template = html`
    <style>
    ${globalStyle}
    :host{
      display: block;
      overflow: hidden;
      position: absolute;
      top:56px;
      width: 100%;
      bottom:0px;
      left:0px;
      text-align: left;
    }
    :host > .In{
      width: 100%;
      height: 100%;
      white-space: nowrap;
    }
    :host > .In > *{
      width: 100%;
      height: 100%;
      position: relative;
      display:inline-block;
      vertical-align:top;
      white-space:normal;
      overflow: hidden;
    }
    </style>

    <div class="In"></div>`;

    render( template, shadowRoot );

    this.ribbon = shadowRoot.querySelector( 'div.In' ) as HTMLElement;

    // Append initial element to ribbon
    this.ribbon.append( document.createElement( 'main-index' ) );
  }

  /** @method */
  async stateChanged({ page }: StoreState ) {
    const oldValue = this.indexPage;
    const newIsIndex = page.split( ':' )[ 0 ] === 'index';
    if( newIsIndex === oldValue ) return;

    this.indexPage = newIsIndex;

    //let newIsIndex: boolean = this.indexPage;
    //let oldValue: boolean | undefined = changes.get( 'indexPage' );

    if( this.animation ) { // Over-clicking
      this.animationObject?.cancel?.(); // Stop current animation
    }
    else {
      this.animation = true;
    }

    // Remove old element from old animation
    // @ts-ignore
    for( const element of this.ribbon.children as HTMLElement[] ) {
      if( element.dataset.old === 'true' ) element.remove();
    }

    // Remove all other old elements
    //if( this.ribbon.childElementCount >= 2 ){
    //  this.ribbon.children[ this.ribbon.childElementCount - 1 ].remove();
    //}

    const old = this.ribbon.lastElementChild as HTMLElement;
    old.dataset.old = 'true'; // Mark old element for future conflicts

    const current = document.createElement(
      newIsIndex ? 'main-index' : 'main-login'
    ) as ( HTMLElement & { 'onAnimationComplete'?: Function });
    current.style.cssText = 'visibility:hidden;';

    // Adding new elements
    if( newIsIndex ) this.ribbon.prepend( current );
    else this.ribbon.append( current );
    
    // @ts-ignore
    await current.updateComplete; // NOTE ! part of LitElement

    if( newIsIndex ) {
      this.ribbon.style.cssText = 'margin-left:-100%;';
    }

    await new Promise( resolve => { setTimeout( resolve, 0 ); }); // NOTE setTimeout due to Chrome bug

    current.style.cssText = '';

    try {
      const animationObject = this.ribbon.animate(
        [
          { 'marginLeft': newIsIndex ? '-100%' : '0%' },
          { 'marginLeft': newIsIndex ? '0%' : '-100%' }
        ],
        { 'duration': 250, 'easing': 'linear' }
      );
      this.animationObject = animationObject;

      await new Promise( ( resolve, reject ) => {
        animationObject.onfinish = resolve;
        animationObject.oncancel = () => {
          reject( new Error( 'page-switch animation is broken' ) );
        };
      });
      

      // Reach this lines only if animation is successfull
      old.remove();

      this.ribbon.style.cssText = '';
      current.onAnimationComplete?.();
  
      this.animation = false;
    }
    catch ( x ) {}
  }
}
customElements.define( 'page-switch', PageSwitch );
