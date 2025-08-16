/** @function */
export default async( element: HTMLElement ): Promise<void> => {
  const animation = element.animate(
    [ { 'opacity': 1 }, { 'opacity': 0 } ],
    {
      'duration': 300,
      'easing': 'linear'
    }
  );
  
  await new Promise( resolve => { animation.onfinish = resolve; });
  element.remove();
};
