// List of possible steps in this browser. Order matters
const possibleSteps: string[] = ( () => {
  if( typeof browser === 'undefined' ) { // Chrome
    return [
      'proxyApi', 'noProxyExtensions',
      'httpConnection', 'httpsConnection',
      'browsecApi',
      'httpProxyConnection', 'httpsProxyConnection'
    ];
  }

  const mobileView: boolean = ( () => {
    const hasTouch =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const mobileOs =
      /android [0-9]/i.test( navigator.userAgent )
      || /iphone;/i.test( navigator.userAgent )
      || /ipad;/i.test( navigator.userAgent )
      || /ipod;/i.test( navigator.userAgent );
    
    return hasTouch && mobileOs;
  })();

  if( !mobileView ) { // Desktop Firefox
    return [
      'noProxyExtensions', 'httpConnection', 'httpsConnection',
      'browsecApi'
    ];
  }

  // Firefox for Android
  return [
    'httpConnection', 'httpsConnection', 'browsecApi'
  ];
})();


export default Object.freeze( possibleSteps );
