export default (
  { duration, action }: {
    'duration': number,
    'action': ( percent: number ) => any
  }
): Promise<void> => {
  let startStamp = performance.now();

  return new Promise( resolve => {
    /** @function */
    let step = ( timestamp: number ) => {
      if( timestamp - startStamp >= duration ) {
        resolve(); return;
      }

      let percent: number = ( timestamp - startStamp ) / duration;

      action( percent );
      requestAnimationFrame( step );
    };

    requestAnimationFrame( step );
  });
};
