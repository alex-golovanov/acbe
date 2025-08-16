import animateCssFilter from './animateCssFilter';
import fadeOut from './fadeOut';
import generateRectangleMaskStyle from '../../tools/generateRectangleMaskStyle';
import jitsu from 'jitsu';
import storage from 'storage';


/** @function */
const step = (
  { button, parent }: {
    'button': HTMLElement,
    'parent': HTMLElement
  }
): Promise<boolean> => new Promise( resolve => {
  // @ts-ignore
  const zoomRatio = window.zoomRatio as number;
  const parentBaseStyle = parent.style.cssText;

  const totalWidth = self.innerWidth;
  const totalheight =
    typeof browser === 'undefined' ? 415 : self.innerHeight;

  const rect = button.getBoundingClientRect();

  const buttonHeight = button.offsetHeight;
  const buttonWidth = button.offsetWidth;

  const rectangleHeight = button.offsetHeight + 30;

  const maskStyle = generateRectangleMaskStyle({
    'block': { 'width': totalWidth, 'height': self.innerHeight },
    'rectangle': {
      'x': totalWidth / 2 - zoomRatio * ( button.offsetWidth + 30 ) / 2,
      'y': ( rect.y - 15 ) * zoomRatio,
      'height': rectangleHeight * zoomRatio,
      'width': ( button.offsetWidth + 30 ) * zoomRatio
    }
  });

  const doubleButton = document.createElement( 'div' );
  doubleButton.textContent = button.textContent;

  const style = getComputedStyle( button );
  doubleButton.style.cssText =
    `background-color: ${style.getPropertyValue( 'background-color' )};` +
    `border-radius: ${style.getPropertyValue( 'border-radius' )};` +
    `color: ${style.getPropertyValue( 'color' )};` +
    `font-family: ${style.getPropertyValue( 'font-family' )};` +
    `font-size: ${style.getPropertyValue( 'font-size' )};` +
    `height: ${buttonHeight}px;` +
    `line-height: ${style.getPropertyValue( 'line-height' )};` +
    `width: ${buttonWidth}px;` +
    'text-align: center;' +
    'position: absolute;' +
    `top: ${rect.y}px;` +
    `left: ${( totalWidth - buttonWidth * zoomRatio ) / ( 2 * zoomRatio )}px;` +
    'cursor: pointer;' +
    `zoom: ${zoomRatio};`;

  const overlayWithButton: HTMLElement & { 'bottom'?: number } =
    document.createElement( 'first-start-tips-start-vpn' );
  overlayWithButton.style.cssText = maskStyle + `font-size:calc( ${zoomRatio} * 14px );`;

  overlayWithButton.bottom =
    totalheight - rect.y + ( rectangleHeight - buttonHeight ) / 2 + 6;

  // Events
  doubleButton.addEventListener( 'click', async() => {
    jitsu.track( 'onboarding1_vpnon' );

    storage.set( 'startup tips shown', true );
    
    button.click();

    parent.style.cssText = parentBaseStyle;
    overlayWithButton.remove();
    doubleButton.remove();

    storage.set( 'First start tips: phase', 2 );

    resolve( false );
  });

  overlayWithButton.addEventListener( 'close', async() => {
    jitsu.track( 'onboarding1_close' );

    await Promise.all( [
      fadeOut( overlayWithButton ),

      animateCssFilter({
        'setValue': cssFilterValue => {
          parent.style.cssText = parentBaseStyle + cssFilterValue + maskStyle;
        },
        'setEndValue': () => {
          parent.style.cssText = parentBaseStyle;
        }
      })
    ] );
    
    doubleButton.remove();

    storage.set( 'First start tips: phase', 2 );

    resolve( false );
  });

  // Styling and appending
  parent.style.cssText = parentBaseStyle + 'filter: blur(3px);' + maskStyle;

  document.body.append( overlayWithButton );
  document.body.append( doubleButton );
});


export default async() => {
  jitsu.track( 'onboarding1_show' );

  const parent =
    document.querySelector( 'div.MainContainer' ) as ( HTMLElement | null );
  let indexHome: HTMLElement;
  try {
    const pageSwitch = document.querySelector( 'page-switch' ); // @ts-ignore
    await pageSwitch.updateComplete;

    // @ts-ignore
    const mainIndex = pageSwitch.shadowRoot.querySelector( 'main-index' ); // @ts-ignore
    await mainIndex.updateComplete;

    // @ts-ignore
    indexHome = mainIndex.shadowRoot.querySelector( 'index-home' ); // @ts-ignore
    await indexHome.updateComplete;
  }
  catch ( x ) {
    return;
  }

  const button = ( () => {
    try {
      // @ts-ignore
      return indexHome.shadowRoot.querySelector( '.Inactive_Button' ) as (
        HTMLElement | null
      );
    }
    catch ( x ) {
      return null;
    }
  })();
  if( !parent || !button ) return;
  
  
  await step({ button, parent });
};
