type ComboFormatType = {
  disabled?: boolean,
  value: string,
  format: 'domain'
} | {
  disabled?: boolean,
  value: string,
  format: 'full domain'
} | {
  disabled?: boolean,
  value: RegExp | string,
  format: 'regex'
};


export default <T extends ComboFormatType>(
  filters: T[], domain: string
): T | undefined => {
  return filters?.find( ( item: ComboFormatType ) => {
    if( item.disabled ) return false; // Ignore disabled filters

    switch( item.format ) {
      case 'domain':
        return domain.endsWith( '.' + item.value ) || domain === item.value;
      case 'full domain':
        return domain === item.value;
      case 'regex':
        if( item.value instanceof RegExp ) {
          return item.value.test( domain );
        } else {
          const regex = new RegExp( item.value );
          return regex.test( domain );
        }
    }

    return false; // Error case
  });
};
