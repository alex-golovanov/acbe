/* global StoreState */
import urlModifyParameters from 'tools/urlModifyParameters';

type urlObject = { [property: string]: string | number | boolean };

export const browsecLink = ({
  action = (search) => search,
  url,
  storeState,
  expvarid,
}: {
  action?: (search: urlObject) => urlObject;
  url: string;
  storeState: StoreState;
  expvarid?: string | null;
}): string => {
  const baseObject: urlObject = ((): urlObject => {
    if (expvarid) {
      return { expvarid };
    }

    return {};
  })();

  /** @function */
  const daysAction = (search: urlObject): urlObject =>
    Object.assign(baseObject, action(search), {
      instd: storeState.daysAfterInstall,
    });

  return urlModifyParameters(url, daysAction);
};
