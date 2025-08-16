/** Get domain from URL. Returns domain or null in case of error
@function */
export default ( url: string | null | undefined ): string | null => {
  if( !url ) return null;

  if( url.startsWith( 'about:' ) ) return null;
  try {
    let { protocol, 'hostname': domain }: { protocol: string, hostname: string } =
      new URL( url );
    if( ![ 'http:', 'https:' ].includes( protocol ) ) return null;

    return domain;
  }
  catch ( e ) {
    return null;
  }
};
