import jitsu from 'jitsu';
import storage from 'storage';

const STORAGE_KEY = 'First start accept terms and conditions: phase';

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
  const overlayWithButton: HTMLElement & { 'bottom'?: number } =
    document.createElement( 'first-start-agree-terms-conditions' );
  overlayWithButton.style.cssText = `font-size:calc( ${zoomRatio} * 14px );`;
  overlayWithButton.bottom = 30;

  overlayWithButton.addEventListener( 'accept', async() => {
    jitsu.track( 'policy_accepted', { type: 'ext' });

    storage.set( 'startup terms and conditions accepted shown', true );

    overlayWithButton.remove();
 
    storage.set( STORAGE_KEY, 2 );

    resolve( false );
  });

  // Styling and appending
  parent.style.cssText = parentBaseStyle;
  document.body.append( overlayWithButton );
});


export default async() => {
  jitsu.track( 'accept_policy_view', { type: 'ext' } );

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
