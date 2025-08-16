// @flow
import sendMessage from 'tools/sendMessage';


export default {
  /** @method */
  'includes': ( offer: string ): Promise<boolean> => (
    sendMessage({ 'type': 'ShowedOffers.includes', offer })
  ),

  /** @method */
  'push': ( offer: string ): Promise<void> => (
    sendMessage({ 'type': 'ShowedOffers.push', offer })
  )
};
