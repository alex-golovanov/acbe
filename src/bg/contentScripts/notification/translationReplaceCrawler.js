// @flow
const variableRegExp = /%[a-z0-9_]+%/ig;


/** @function */
let translationReplaceCrawler/*: ( object: Object, translation: { [ string ]: string } ) => Object*/ =
  ( object, translation ) => {
    let keys/*: string[]*/ = Object.keys( translation );
  
    if( object.text ) {
      let matches = object.text.match( variableRegExp );
      if( matches ) {
        let foundKeys = Array.from( new Set( matches ) )
          .map( item => item.slice( 1, -1 ) )
          .filter( item => keys.includes( item ) );
      
        foundKeys.forEach( key => {
          object.text = object.text
            .replace( new RegExp( `%${key}%`, 'g' ), translation[ key ] );
        });
      }
    }
    if( object.style ) {
      let matches = object.style.match( variableRegExp );
      if( matches ) {
        let foundKeys = Array.from( new Set( matches ) )
          .map( item => item.slice( 1, -1 ) )
          .filter( item => keys.includes( item ) );
      
        foundKeys.forEach( key => {
          object.style = object.style
            .replace( new RegExp( `%${key}%`, 'g' ), translation[ key ] );
        });
      }
    }
  
    if( object.children ) {
      object.children.forEach( child => {
        translationReplaceCrawler( child, translation );
      });
    }

    return object;
  };


export default translationReplaceCrawler;
