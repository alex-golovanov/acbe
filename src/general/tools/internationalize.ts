const englishMessages = require( '_locales/en/messages.json' );
export const qualityLanguagesList = [ 'en', 'ru', 'uk' ];
const _browser = typeof browser !== 'undefined' ? browser : chrome;

/** Helper function to substitute templates like $1, $2, $3... in string line as per i18n.getMessage API
@function */
function substituteTemplate( str: string, substitutions: string[] ) {
  if( !substitutions || substitutions.length === 0 ) {
    return str;
  }
  return str.replace( /\$(\d+)/g, function( match, index ) {
    const substitutionIndex = parseInt( index ) - 1;
    if( substitutionIndex >= 0 && substitutionIndex < substitutions.length ) {
      return substitutions[ substitutionIndex ];
    }
    return match;
  });
}

/** Get data from locales through chrome.i18n.getMessage
@function */
export default ( key: string, substitutions?: any ): string => {
  // return English messages for languages not in the qualityLanguagesList
  const locale = _browser.i18n.getUILanguage();
  const language = locale.substring( 0, 2 ); // get the first two letters of the locale, e.g. 'en' from 'en-US'
  if( !qualityLanguagesList.includes( language ) ) {
    const message = englishMessages[ key ]?.message || key;
    // make substitutions in the message as by i18n specification
    const messageWithSubstitutions = substituteTemplate( message, substitutions );
    return messageWithSubstitutions;
  }
  // return the message for the current language using i18n.getMessage API
  try {
    const message = _browser.i18n.getMessage( key, substitutions ) || key;
    return message;
  }
  catch ( error ) {
    // Firefox
    return key;
  }
};
