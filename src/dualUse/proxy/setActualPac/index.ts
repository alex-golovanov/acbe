/* global LowLevelPac */
import chrome from './chrome';
import firefox from './firefox';


export default ( lowLevelPac: LowLevelPac ) => {
  if( typeof browser === 'undefined' ) return chrome( lowLevelPac );
  else return firefox( lowLevelPac );
};
