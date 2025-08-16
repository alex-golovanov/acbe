const { userAgent } = navigator;


const isChrome = (
  typeof browser === 'undefined'
  && userAgent.includes( 'Chrome' )
  && [ 'Edg', 'Edge' ].every( item => !userAgent.includes( item ) ) // 'OPR', <- Opera uses special icon as well as Chrome
);
let version: number | undefined;
if( isChrome ) {
  try { // @ts-ignore
    version = Number( userAgent.match( /Chrome\/\d+/ )[ 0 ].split( '/' )[ 1 ] );
  }
  catch ( x ) {}
}


export default Boolean( isChrome && version && version >= 84 );
