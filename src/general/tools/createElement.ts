/* global TreeElement, TreeTextNode */
type TypedTreeTextNode = {
  'text': string,
  'type': 'node'
};
type TypedTreeElement = {
  'attributes'?: { [ key: string ]: string },
  'children'?: Array<TreeElement | TreeTextNode>,
  'class'?: string,
  'node'?: ( node: HTMLElement | Node ) => any,
  'style'?: string,
  'tag': string,
  'text'?: string,
  'type': 'element'
};

const possibleAttributes: readonly string[] = Object.freeze( [
  'autocomplete', 'colspan', 'height', 'href', 'name', 'rowspan', 'src',
  'target', 'type', 'width'
] );


/** @function */
let typescriptConverter = (
  preObject: TreeTextNode | TreeElement // @ts-ignore
): TypedTreeTextNode | TypedTreeElement => Object.assign(
  {},
  preObject, // @ts-ignore
  { 'type': typeof preObject.tag === 'string' ? 'element' : 'node' }
);


/** Self-looped function to create elements tree
@function */
const createElement = (
  preObject: TreeTextNode | TreeElement,
  classModification: ( className: string ) => string = className => className
): HTMLElement | Node => {
  let object: TypedTreeTextNode | TypedTreeElement =
    typescriptConverter( preObject );
  
  // Node case
  if( object.type === 'node' ) {
    if( typeof object.text !== 'string' ) {
      throw new Error( 'createElement called without text property' );
    }
    return document.createTextNode( object.text );
  }

  // Element case
  const { attributes, tag } = object;
  let element = document.createElement( tag );
  if( object.class ) {
    let className = classModification( object.class );
    element.setAttribute( 'class', className );
  }
  if( object.style ) element.setAttribute( 'style', object.style );
  if( attributes ) {
    for( const [ attribute, value ] of Object.entries( attributes ) ) {
      const incompatibleAttributes: boolean =
        !possibleAttributes.includes( attribute )
        && !attribute.startsWith( 'data-' );
      if( incompatibleAttributes ) continue;
      if( attribute === 'src' && tag !== 'img' ) continue;

      element.setAttribute( attribute, value );
    }
  }
  if( object.node ) object.node( element );
  if( object.text ) element.textContent = object.text;

  if( object.children ) {
    const children: Array<HTMLElement | Node> = object.children.map(
      child => createElement( child, classModification )
    );

    children.forEach( child => {
      element.appendChild( child );
    });
  }

  return element;
};


export default createElement;
