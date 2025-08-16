/** @function */
export default (
  goalScroll: integer, duration: integer
): Promise<void> => {
  let startStamp = performance.now();
  let currentScrollTop = self.pageYOffset;

  return new Promise( resolve => {
    let loop = () => {
      let delta = performance.now() - startStamp;
      if( delta > duration ) {
        resolve(); return;
      }

      self.scrollTo(
        0, currentScrollTop + ( goalScroll - currentScrollTop ) * delta / duration
      );
      requestAnimationFrame( loop );
    };
    requestAnimationFrame( loop );
  });
};
