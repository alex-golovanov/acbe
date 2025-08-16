/** Add text style in page
@function
@param css - like '.class{ display: block; }' */
export default ( css: string ): void => {
  let style/*: HTMLStyleElement*/ = document.createElement( 'style' );

  style.type = 'text/css';
  style.appendChild( document.createTextNode( css ) );

  document.head.appendChild( style );
};
