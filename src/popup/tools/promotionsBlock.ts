// @flow
import sendMessage from 'tools/sendMessage';


/** @function */
export default ( value: boolean ): Promise<void> => (
  sendMessage({ 'type': 'promotionsBlock.set', value })
);
