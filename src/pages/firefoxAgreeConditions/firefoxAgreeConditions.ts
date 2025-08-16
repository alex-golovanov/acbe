import storage from 'storage';
import getUserLanguage from 'tools/getUserLanguage';
import internationalize from 'tools/internationalize';
import { STORAGE } from 'constants/storageKeys';

import './termsAndConditions';

/** Separate page */
document.title = internationalize('terms_and_conditions_ff');

(async () => {
  const language = getUserLanguage();

  window.language = language;

  document.body.prepend(document.createElement('firefox-terms-and-conditions'));
})();
