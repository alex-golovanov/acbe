/* global NodeListOf, Promotion */
// Chrome V2 only
import ga from 'ga';

/** @function */
const sendMessage = ( message: any ): Promise<any> => {
  if( typeof browser !== 'undefined' ) {
    return browser.runtime.sendMessage( message );
  }

  return new Promise( resolve => {
    chrome.runtime.sendMessage( message, resolve );
  });
};


const domLoaded = ( async() => {
  const state = document.readyState;

  if( state !== 'loading' ) return;

  await new Promise( resolve => {
    window.addEventListener( 'DOMContentLoaded', resolve );
  });
})();

const informationPromise: Promise<{
  'daysAfterInstall': integer,
  'expvarid': string | null,
  'promotion'?: Promotion
}> = sendMessage({
  'type': 'promo page: get information',
  'url': location.href
});


( async() => {
  const [{ daysAfterInstall, expvarid, promotion } ] =
    await Promise.all( [ informationPromise, domLoaded ] );

  const links =
    document.querySelectorAll( 'a[href*="/orders/new"]' ) as NodeListOf<HTMLAnchorElement>;

  const clientId: string = await ga.full.userIdPromise;

  for( const link of links ) {
    const url = link.href;
    const urlObject = new URL( url );

    urlObject.searchParams.set( 'instd', String( daysAfterInstall ) );

    if( expvarid ) {
      urlObject.searchParams.set( 'expvarid', expvarid );
    }
    urlObject.searchParams.set( 'cid', String( clientId ) );

    link.href = urlObject.toString();

    link.addEventListener( 'click', () => {
      sendMessage({
        'type': 'promo page: click',
        promotion
      });
    });
  }
})();
