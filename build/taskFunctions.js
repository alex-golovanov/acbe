// @flow
const _ = require( 'lodash' );
const fileList = require( './getFileListByPattern' );
const gulp = require( 'gulp' );


// Tasks creators
/** @function */
module.exports.createTask = gulp.task.bind( gulp );


/**
@function
@param name - task name
@param list - like 'src/polymer/*.js' without exclusions
@param handler - files list array as argument, array of streams on return */
module.exports.createMultifileTask = (
  name/*: string*/,
  list/*: string | Array<string>*/,
  handler/*: Function*/
)/*: void*/ => {
  gulp.task( name, async() => {
    // Convert single string to array
    if( typeof list === 'string' ) list = [ list ];

    // List of just files, no magic paterns
    const files/*: Array<string>*/ = _.uniq(
      _.flatten(
        await Promise.all( list.map( async globString => fileList( globString ) ) )
      )
    ).sort();

    /** @type {Array<Stream>} */
    const streams = await Promise.all( handler( files ) );

    await Promise.all( streams.map( stream => new Promise( resolve => {
      stream.on( 'end', resolve );
    }) ) );
  });
};
