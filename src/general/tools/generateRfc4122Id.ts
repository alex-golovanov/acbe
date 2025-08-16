// @flow

/** http://www.ietf.org/rfc/rfc4122.txt */
/** @function */
let chr4 = (): string => Math.random().toString( 16 ).slice( -4 );


/** @function */
export default (): string => (
  chr4() + chr4() +
  '-' + chr4() +
  '-' + chr4() +
  '-' + chr4() +
  '-' + chr4() + chr4() + chr4()
);
