import { qualityLanguagesList } from './internationalize';

const _browser = typeof browser !== 'undefined' ? browser : chrome;

/** @function */
export default () => {
  const locale = _browser.i18n.getUILanguage();
  const language = locale.substring( 0, 2 );

  if( !qualityLanguagesList.includes( language ) ) {
    return 'en';
  }

  return language;
}
