import buildAnimationForChrome from './buildAnimationForChrome';
import buildAnimationForOthers from './buildAnimationForOthers';
import chromeView from './chromeView';
import render from './useAnimationTemplate';
import { LitElement, PropertyValues } from 'lit';


class UseAnimation extends LitElement {
  render() {
    return render.call( this );
  }

  /** @method */
  async firstUpdated( changedProperties: PropertyValues<any> ) {
    super.firstUpdated( changedProperties );

    // Animation
    const shadowRoot = this.shadowRoot;
    if( !shadowRoot ) throw new Error( 'Shadow root not found' );

    const animationElement = shadowRoot.querySelector( 'div.Animation' ) as (
        HTMLElement | null
      );
    if( !animationElement ) throw new Error( 'Animation element not found' );

    const animation = chromeView
      ? buildAnimationForChrome( animationElement )
      : buildAnimationForOthers( animationElement );

    /** @function */
    const loop = async() => {
      await animation.start();
      loop();
    };
    loop(); // Initial
  }
}
customElements.define( 'use-animation', UseAnimation );


export default UseAnimation;
