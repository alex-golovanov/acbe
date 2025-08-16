/* Converts number to uppercase alphabet letter
0 -> A, 1 -> B, 2 -> C, etc */
export default ( number: number ) => {
  if( typeof number !== 'number' ) {
    throw new Error( // @ts-ignore
      `Not numeric value ${number.toString()} passed to numberToAlphabetLetter function`
    );
  }

  return String.fromCharCode( number + 65 );
};
