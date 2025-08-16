/** @function */
export default ({ setValue, setEndValue }: {
  'setValue': ( filterCssValue: string ) => any,
  'setEndValue': () => any
}): Promise<void> => new Promise( ( resolve ) => {
  const startStamp = performance.now();
  const loop = ( stamp: number ) => {
    if( stamp - startStamp >= 300 ) {
      setEndValue();
      resolve();
      return;
    }
    
    const percent = 1 - ( stamp - startStamp ) / 300;
    const filterValue = 3 * percent;
    setValue( `filter: blur(${filterValue}px);` );

    requestAnimationFrame( loop );
  };
  requestAnimationFrame( loop );
});
