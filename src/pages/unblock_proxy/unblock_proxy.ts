import './block';
import getUserLanguage from 'tools/getUserLanguage';
import internationalize from 'tools/internationalize';
import store from 'store';


// Separate page
document.title = internationalize( 'your_proxy_settings_are_blocked' );


( async() => {
  await store.initiate();

  const language = getUserLanguage();

  // @ts-ignore
  window.language = language;

  if( language === 'ru' ) {
    document.documentElement.setAttribute( 'lang', 'ru' );
  }

  const parentElement = document.querySelector( 'div.main' );
  parentElement?.append?.( document.createElement( 'main-block' ) );
})();
