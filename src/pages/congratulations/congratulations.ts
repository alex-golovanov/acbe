import './blockModern';

import config from 'config';
import getUserLanguage from 'tools/getUserLanguage';
import internationalize from 'tools/internationalize';
import jitsu from 'jitsu';
import storage from 'storage';


document.title = internationalize( 'you_just_installed_browsec' );

// tracking congrats numbers for analytics
( async() => {
  let congratsNumber = await storage.get( 'congrats_number' ) || 0;
  congratsNumber++;
  jitsu.track( 'congrats_tab_open', { 'congrats_number': congratsNumber.toString() });
  await storage.set( 'congrats_number', congratsNumber );
})();

const domLoadPromise = new Promise<void>( resolve => {
  window.addEventListener( 'DOMContentLoaded', () => {
    resolve();
  });
});

( async() => {
  const language = getUserLanguage();

  // @ts-ignore
  window.language = language;

  if( language === 'ru' ) {
    document.documentElement.setAttribute( 'lang', 'ru' );
  }

  await domLoadPromise;

  const parentElement = document.querySelector( 'div.Main > div.In' );
  parentElement?.append?.( document.createElement( 'main-block-modern' ) );
})();
