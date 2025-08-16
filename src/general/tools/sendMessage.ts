/** @function */
export default ( ...args: any[] ): Promise<any> => {
  if( typeof browser !== 'undefined' ) {
    return browser.runtime.sendMessage.apply( browser.runtime, args );
  }

  return new Promise( ( resolve, reject ) => {
    /** @function */
    const callback = ( response: any ) => {
      if( chrome.runtime.lastError ) reject( chrome.runtime.lastError );
      else resolve( response );
    };
    args.push( callback );
    chrome.runtime.sendMessage.apply( chrome.runtime, args );
  });
};
