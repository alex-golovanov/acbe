// @flow
/** @function */
module.exports = ( iniText/*: string*/ )/*: string[] */ => {
  iniText = iniText.trim().replace( /\r/g, '' );
  
  return iniText.split( /\n/g ).reduce( ( carry, part ) => {
    part = part.trim();
    if( part ) carry.push( part );

    return carry;
  }, [] );
};
