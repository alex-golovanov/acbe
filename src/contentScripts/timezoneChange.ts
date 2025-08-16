import dateCodeChangeText from 'bg/contentScripts/timezoneChange/dateCodeChange.js';


/** @function */
const sendMessage = ( message: any ): Promise<any> => {
  if( typeof browser !== 'undefined' ) {
    return browser.runtime.sendMessage( message );
  }

  return new Promise( resolve => {
    chrome.runtime.sendMessage( message, resolve );
  });
};


( async() => {
  const bgResponse: { // Both in minutes
    'original': integer,
    'proxy': integer | null
  } | void = await sendMessage({ 'type': 'date', 'url': location.href });
  if( !bgResponse ) return;

  let {
    'original': originalTimeZoneOffset,
    'proxy': proxyTimeZoneOffset
  } = bgResponse;
  if( proxyTimeZoneOffset === null ) return;

  let offsetDifference: integer =
    proxyTimeZoneOffset - originalTimeZoneOffset;

  const code = `
  let offsetDifference = ${offsetDifference};
  let proxyTimeZoneOffset = ${proxyTimeZoneOffset};

  ${dateCodeChangeText}

  Date = dateCodeChange( Date, offsetDifference, proxyTimeZoneOffset );
  `;

  const script = document.createElement( 'script' );
  script.innerText = code.replace( /\n/gm, '' );

  if( !document.documentElement ) return; // Flow crap
  document.documentElement.insertBefore(
    script, document.documentElement.firstChild
  );
})();
