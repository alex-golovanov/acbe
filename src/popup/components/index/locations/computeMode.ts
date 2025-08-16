/* global LocationsRenderServerData */
/** @function */
export default (
  item: LocationsRenderServerData | { 'premium': boolean, 'code': string },
  premiumUser: boolean,
  country: string | null
): 'change' | 'current' | 'premium' => {
  if( item.premium && !premiumUser ) return 'premium';
  if( item.code === country ) return 'current';
  return 'change';
};
