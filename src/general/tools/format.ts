/** Replaces in initial string things like '{1}' to value of args[1]
@param {string} str
@param {*} args
@return {string} */
export default ( str: string, ...args: string[] ) => (
  str.replace( /\{(\d+)\}/g, ( match, number ) => (
    args[ number ] !== undefined ? args[ number ] : match
  ) )
);
