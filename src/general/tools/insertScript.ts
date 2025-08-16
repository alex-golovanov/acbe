/** @function */
export default ( text: string ): void => {
  let parent: HTMLElement = document.documentElement;

  let script/*: HTMLScriptElement*/ = document.createElement( 'script' );

  script.text = text;
  script.async = false;

  parent.insertBefore( script, parent.firstChild );
  parent.removeChild( script );
};
