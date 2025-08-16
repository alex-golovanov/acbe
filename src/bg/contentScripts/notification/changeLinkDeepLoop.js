/** @function */
const deepLoop/*: ( object: any, linkModification: ( originalLink: string ) => string ) => void */ =
  ( object, linkModification ) => {
    if( object.tag === 'a' ) {
      if( !object.attributes ) return;

      object.attributes.href =
        linkModification( object.attributes.href );
    }
    if( !object.children ) return;

    object.children.forEach( child => {
      deepLoop( child, linkModification );
    });
  };


export default deepLoop;
