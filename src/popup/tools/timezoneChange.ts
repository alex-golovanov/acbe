// @flow
import sendMessage from 'tools/sendMessage';


export default {
  /** @method */
  'set': ( value: boolean ): Promise<void> => (
    sendMessage({ 'type': 'timezoneChange.set', value })
  )
};
