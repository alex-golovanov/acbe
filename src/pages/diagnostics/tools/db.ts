import sendMessage from 'tools/sendMessage';


const getAll = async(): Promise<any[]> => {
  let output = await sendMessage({ 'type': 'db.getAll' });
  if( !output ) throw new Error( 'Connection with background failed' );

  return output;
};


export default { getAll };
