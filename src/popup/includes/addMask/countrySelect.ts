import animateCssFilter from './animateCssFilter';
import fadeOut from './fadeOut';
import generateRectangleMaskStyle from '../../tools/generateRectangleMaskStyle';
import jitsu from 'jitsu';
import internationalize from 'tools/internationalize';
import storage from 'storage';
import store from 'store';


export default async() => {
  jitsu.track( 'onboarding_countries' );

  //// 1. Get real elements
  const parent =
    document.querySelector( 'div.MainContainer' ) as ( HTMLElement | null );
  const parentBaseStyle = parent?.style?.cssText || '';

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
      return indexHome.shadowRoot.querySelector( 'active-country' ) as (
        HTMLElement | null
      );
    }
    catch ( x ) {
      return null;
    }
  })();
  if( !parent || !button ) return;


  //// 2. Get initial dimensions
  const totalWidth = self.innerWidth;
  const totalheight = self.innerHeight;

  const rect = button.getBoundingClientRect();

  const buttonHeight = button.offsetHeight;
  const buttonWidth = button.offsetWidth;

  const rectangleHeight = button.offsetHeight + 30;


  //// 3. Get mask style
  const maskStyle = generateRectangleMaskStyle({
    'block': { 'width': totalWidth, 'height': totalheight },
    'rectangle': {
      'x': totalWidth / 2 - button.offsetWidth / 2 - 15,
      'y': rect.y - 15,
      'height': rectangleHeight,
      'width': button.offsetWidth + 30
    }
  });


  //// 4. Create new elements
  const { userPac, ping } = await store.getStateAsync();
  const country = userPac.country;

  const doubleButton = document.createElement( 'active-country' );
  // @ts-ignore
  doubleButton.country = country;
  // @ts-ignore
  doubleButton.countryName = country
    ? internationalize( 'country_' + country )
    : '';
  // @ts-ignore
  doubleButton.rating = ( () => {
    if( !ping.length || !country ) return;

    return ping.find( ({ 'country': pingCountry, premium }) => (
      pingCountry === country && !premium
    ) )?.mark;
  })();

  doubleButton.style.cssText =
    'text-align: center;' +
    'position: absolute;' +
    `top: ${rect.y}px;` +
    `left: ${( totalWidth - buttonWidth ) / 2}px;` +
    `right: ${( totalWidth - buttonWidth ) / 2}px;` +
    'cursor: pointer;';

  const overlay: HTMLElement & { 'bottom'?: number } =
    document.createElement( 'first-start-tips-country-select' );
  overlay.style.cssText = maskStyle;
  overlay.bottom =
    totalheight - rect.y + ( rectangleHeight - buttonHeight ) / 2 + 6;


  //// 5. Attach events
  doubleButton.addEventListener( 'click', async() => {
    jitsu.track( 'onboarding_countries_click' );

    storage.set( 'startup tips: country select: phase', 2 );
    
    button.click();

    parent.style.cssText = parentBaseStyle;
    overlay.remove();
    doubleButton.remove();
  });

  overlay.addEventListener( 'close', async() => {
    jitsu.track( 'onboarding_countries_close' );

    storage.set( 'startup tips: country select: phase', 2 );
    
    await Promise.all( [
      fadeOut( overlay ),

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
  });


  //// 6. Styling + show new elements
  parent.style.cssText = parentBaseStyle + 'filter: blur(3px);' + maskStyle;

  document.body.append( overlay );
  document.body.append( doubleButton );
};
