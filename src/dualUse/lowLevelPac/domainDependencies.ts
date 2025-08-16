/* global DomainDependency, DOMAIN_DEPENDENCIES */
// @ts-ignore
const dependencies: DomainDependency[] = DOMAIN_DEPENDENCIES.map(
  ( block: any[] ): DomainDependency => {
    const domain: string[] = [];
    const fullDomain: string[] = [];
    const regex: RegExp[] = [];

    for( const { format, value } of block ) {
      switch( format ) {
        case 'domain':
          domain.push( value );
          break;
        case 'full domain':
          fullDomain.push( value );
          break;
        case 'regex':
          regex.push( new RegExp( value ) );
          break;
      }
    }

    return { domain, fullDomain, regex };
  }
);

export default dependencies;
