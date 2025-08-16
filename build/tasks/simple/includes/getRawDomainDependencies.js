// @flow
// const beautify = require( 'js-beautify' ).js_beautify;
const _ = require( 'lodash' );
const fs = require( 'fs' ).promises;
const iniTextToArray = require( '../../../iniTextToArray' );
const handleExceptions = require( './handleExceptions' );


const libraryFolder = 'domainDependencies/raw';
const ownDataFolder = 'domainDependencies/data';

function isValidRegex(pattern) {
  try {
    new RegExp(pattern);
    return true;
  } catch (e) {
    return false;
  }
}

/** @function */
module.exports = async()/*: Promise<string[][]> */ => {
  let [
    libraryFiles,
    ownFiles
  ]/*: [ string[], string[] ] */ = await Promise.all( [
    ( async() => {
      let files = await fs.readdir( libraryFolder );
      return files.filter( ( name ) => (
        !name.startsWith( 'category-' )
        && !name.includes( 'tld' )
        && !name.startsWith( 'geolocation-' )
        && name !== 'private'
      ) );
    })(),

    fs.readdir( ownDataFolder )
  ] );

  let [
    libraryTextList,
    ownTextList
  ]/*: [ Array<{ 'name': string, 'text': string }>, Array<{ 'name': string, 'text': string }> ] */ =
    await Promise.all( [
      Promise.all( libraryFiles.map( async( name ) => {
        let fullPath = libraryFolder + '/' + name;
        let text = await fs.readFile( fullPath, 'utf8' );

        return { name, text };
      }) ),

      Promise.all( ownFiles.map( async( name ) => {
        let fullPath = 'domainDependencies/data/' + name;
        let text = await fs.readFile( fullPath, 'utf8' );

        return { name, text };
      }) )
    ] );

  let libraryDataList = libraryTextList
    .sort( ({ 'text': a }, { 'text': b }) => {
      let sort1 = a.includes( 'include:' );
      let sort2 = b.includes( 'include:' );

      if( sort1 && !sort2 ) return -1;
      if( !sort1 && sort2 ) return 1;
      return 0;
    })
    .reduce( ( carry, { name, text }) => {
      let parts = iniTextToArray( text ).reduce( ( carry, part ) => {
        part = part
          .replace( /#.+$/g, '' ) // Get comments
          .replace( /\s*@[a-zA-Z\!]+\s*$/g, '' ) // Remove @
          .trim();

        if( part.startsWith( 'regexp:' ) ) {
          if( !isValidRegex(part.replace(/^regexp:/, '') ) ) {
            throw new Error(`[getRawDomainDependencies]: Invalid regular expression: ${part}`);
          }

          if( part.length > 100 ) {
            throw new Error(`[getRawDomainDependencies]: Regular expression is too long: ${part}`);
          }
        }

        if( part ) carry.push( part );

        return carry;
      }, [] );
      if( parts.length ) carry.push({ name, parts });

      return carry;
    }, [] );

  let goal/*: Array<{| 'name': string, 'parts': string[] |}> */ = [];

  libraryDataList.forEach( ( item, indexIndex ) => {
    let newParts = item.parts.slice();
    while( true ) {
      let originalIncludes = newParts
        .filter( part => part.startsWith( 'include:' ) )
      let includes = originalIncludes
        .map( item => item.replace( /^include\:/, '' ) );

      let filteredIncludes = handleExceptions(item.name, includes, ownTextList);
      if( !filteredIncludes.length ) break;

      let extraParts = filteredIncludes.reduce( ( carry, name ) => {
        let dataListItem = libraryDataList.find( item => item.name === name );
        if( dataListItem ) carry = carry.concat( dataListItem.parts );

        return carry;
      }, [] );
      newParts = newParts.concat( extraParts );
      newParts = newParts.filter( part => !originalIncludes.includes( part ) );
    }

    goal.push({
      'name': item.name,
      'parts': newParts
    });
  });

  // Add own dependencies
  goal.push.apply(
    goal,
    ownTextList.map( ({ name, text }) => {
      let parts = iniTextToArray( text );

      return { name, parts };
    })
  );
  goal.sort( ({ 'parts': a }, { 'parts': b }) => b.length - a.length );

  // Remove dublicates
  for( let i = 0; i < goal.length; i++ ) {
    let currentItem = goal[ i ];
    let next = goal.slice( i + 1 );
    if( !next.length ) break;

    let indexes = next
      .filter(
        ({ parts }) => _.intersection( parts, currentItem.parts ).length
      )
      .map( item => goal.findIndex( anotherItem => anotherItem === item ) );
    if( indexes.length ) {
      let parts = new Set( currentItem.parts );

      indexes.sort( ( a, b ) => b - a );
      indexes.forEach( index => {
        goal[ index ].parts.forEach( part => { parts.add( part ); });
        goal.splice( index, 1 );
      });

      currentItem.parts = Array.from( parts );
    }
  }
  let blocks/*: Array<string[]>*/ = goal
    .map( ({ parts }) => parts )
    .filter( item => item.length >= 2 );

  return blocks;

  /*return beautify( JSON.stringify( blocks ), {
    'brace-style': 'collapse',
    'indent_size': 2
  });*/
};
