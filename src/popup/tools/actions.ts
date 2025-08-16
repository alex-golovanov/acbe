/* global LoginError */
import sendMessage from 'tools/sendMessage';


let favorites = {
  /** @method */
  'add': ( country: string ): Promise<void> => (
    sendMessage({ 'type': 'actions.favorites.add', country })
  ),

  /** @method */
  'remove': ( country: string ): Promise<void> => (
    sendMessage({ 'type': 'actions.favorites.remove', country })
  )
};

/** @method */
let login = async(
  { email, password }: { 'email': string, 'password': string }
): Promise<void> => {
  let response = await sendMessage(
    { 'type': 'actions.login', 'data': { email, password } }
  );
  if( response.success ) return response.success;
  if( response.error ) {
    let { status, responseText, message } = response.error;

    let error: LoginError = new Error( message );
    if( status !== undefined ) error.status = status;
    if( responseText !== undefined ) error.responseText = responseText;

    throw error;
  }
};

/** @method */
let logout = (): Promise<any> => sendMessage({ 'type': 'actions.logout' });


export default { favorites, login, logout };
