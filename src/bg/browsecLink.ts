// Any link to browsec.com must contain count of days after installation
// Syntax like urlModifyParameters
import store from 'store';
import urlModifyParameters from 'tools/urlModifyParameters';


type StringsObject = { [ key: string ]: string | number | boolean };


/** @function */
export default (
  url: string,
  action: ( search: StringsObject ) => StringsObject = search => search
): string => {
  /** @function */
  let daysAction = ( search: StringsObject ): StringsObject => Object.assign(
    action( search ),
    { 'instd': store.getStateSync().daysAfterInstall }
  );

  return urlModifyParameters( url, daysAction );
};
