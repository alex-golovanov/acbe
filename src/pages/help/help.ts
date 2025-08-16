import './block';
import getUserLanguage from 'tools/getUserLanguage';
import internationalize from 'tools/internationalize';


/** Separate page */
document.title = internationalize( 'how_to_use_smart_settings' );


( async() => {
  const language = getUserLanguage();

  // @ts-ignore
  window.language = language;

  if( language === 'ru' ) {
    document.documentElement.setAttribute( 'lang', 'ru' );
  }

  document.body.prepend( document.createElement( 'main-block' ) );
})();
