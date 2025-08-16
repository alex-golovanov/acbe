declare type DeclarativeNetRequestModifyHeaderInfo = {
  'header': string, // // The name of the header to be modified.
  'operation': 'remove' // The operation to be performed on a header.
} | {
  // The name of the header to be modified.
  'header': string,
  
  // The operation to be performed on a header.
  'operation': 'append' | 'set',
  
  // The new value for the header.
  'value': string
};