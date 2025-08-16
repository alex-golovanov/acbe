/* global SiteFilter, UserPac */
const { _ } = self;


/** (Only for logined user)
@function */
export default (
  { filters, premiumUser, setProxyState }: {
    'filters': SiteFilter[],
    'premiumUser': boolean,
    'setProxyState': ( newStateOptions: Partial<UserPac> ) => any
  }
): void => {
  filters = _.cloneDeep( filters );

  if( premiumUser ) { // Logined and premium
    if( filters.filter( ({ disabled }) => disabled ).length ) {
      filters.forEach( filter => { filter.disabled = false; });
      setProxyState({ filters });
    }
  }
  else { // Logined, but not premium
    if( filters.filter( ({ disabled }) => !disabled ).length > 1 ) {
      filters.slice( 1 ).forEach( filter => { filter.disabled = true; });
      setProxyState({ filters });
    }
  }
};
