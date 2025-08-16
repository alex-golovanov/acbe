import generateRfc4122Id from 'tools/generateRfc4122Id';


const sessionId = generateRfc4122Id();


/** @function */
export default () => sessionId;
