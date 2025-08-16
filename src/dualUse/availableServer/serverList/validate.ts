export default ( serverList: string[] ) => {
  const valid =
    Array.isArray( serverList )
    && Boolean( serverList.length )
    && serverList.every( item => typeof item === 'string' );

  if( !valid ) throw new Error( 'Invalid data in server list request' );
};
