/* global NodeListOf */
import getUserLanguage from 'tools/getUserLanguage';
import './block';
import internationalize from 'tools/internationalize';

const _browser = typeof browser !== 'undefined' ? browser : chrome;

_browser.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
  const type = message?.type;

  switch( type ) {
    case 'Diagnostics page existence check': {
      sendResponse( true );
      return true;
    }
    case 'Diagnostics: close pages': {
      self.close();
      break;
    }
  }
});

const pageUrl = _browser.runtime.getURL( '/pages/diagnostics/diagnostics.html' );
if( typeof _browser.extension.getViews === 'function' ) {
  const diagnosticsTabs = _browser.extension
    .getViews({ 'type': 'tab' })
    .filter( ({ location }) => location.href === pageUrl );
  if( diagnosticsTabs.length >= 2 ) self.close();
}

const translations: { [key: string]: string } = Object.fromEntries(
  Object.entries({
    'browsec_health_check': 'browsec_healthcheck', //   en: 'Browsec Health Check', ru: 'Диагностика Browsec',
    'description': 'browsec_healthcheck_description', // en: "Browsec Health Check can take few minutes. It will disable and enable Browsec several times. Please don't open any new tabs while diagnostics is in progress.",
  }).map( ( [ key, value ] ) => [ key, internationalize( value ) ] ),
);

( async() => {
  const language = getUserLanguage();

  // @ts-ignore
  window.language = language;

  if( language === 'ru' ) {
    document.documentElement.setAttribute( 'lang', 'ru' );
  }

  {
    const element = document.querySelector( '.Body' );
    if( element ) {
      element.append( document.createElement( 'main-block' ) );
    }
  }
  {
    const element = document.querySelector( '.main' ) as HTMLElement | null;
    if( element ) element.style.cssText = '';
  }

  const collection: NodeListOf<HTMLElement> = document.querySelectorAll(
    '[data-translate-phrase]',
  );
  for( const element of collection ) {
    const attributeValue = element.dataset.translatePhrase;
    if( !attributeValue ) continue;

    const translation = translations[ attributeValue ];
    if( !translation ) continue;

    element.textContent = translation;
  }
})();
