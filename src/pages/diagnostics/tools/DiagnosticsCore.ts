/* global DiagnosticsStepState, ExtensionInfo */
import sendMessage from 'tools/sendMessage';


const _browser = typeof browser !== 'undefined' ? browser : chrome;
let port = _browser.runtime.connect({ 'name': 'diagnostics' });
let listeners: Array<( state: DiagnosticsStepState[] ) => any> = [];

port.onMessage.addListener( newState => {
  listeners.forEach( callback => { callback( newState ); });
});


/** @method */
const getState = async(): Promise<DiagnosticsStepState[]> => {
  let output = await sendMessage({ 'type': 'Diagnostics.getState' });
  if( !output ) throw new Error( 'Connection with background failed' );

  return output;
};

/** @method */
const getSteps = async(): Promise<string[]> => {
  let output = await sendMessage({ 'type': 'Diagnostics.getSteps' });
  if( !output ) throw new Error( 'Connection with background failed' );

  return output;
};

/** @method */
const start = ( extensions: ExtensionInfo[] | undefined ) => sendMessage(
  { 'type': 'Diagnostics.start', extensions }
);


/** @method */
const terminate = (): Promise<void> => (
  sendMessage({ 'type': 'Diagnostics.terminate' })
);


/** @method */
const addListener = (
  listener: ( state: DiagnosticsStepState[] ) => any
): void => {
  listeners.push( listener );
};

/** @method */
const removeListener = (
  listener: ( state: DiagnosticsStepState[] ) => any
)/*: void*/ => {
  listeners = listeners.filter( item => item !== listener );
};


export default {
  addListener, getState, getSteps, removeListener, start, terminate
};
