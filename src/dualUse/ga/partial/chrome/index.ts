import Browser from 'crossbrowser-webextension';
import generateRfc4122Id from 'tools/generateRfc4122Id';
import listeners from './listeners';
import log from 'log';
import mainConfig from 'config';
import request from './request';
import sendMessage from 'tools/sendMessage';
import storage from 'storage';


const config = mainConfig.ga;


const bgRequest = location.href.includes( 'background' );


const sendTypePromise: Promise<'DISABLED' | 'FILTERED' | 'TRACK'> =
  ( async() => {
    const condition =
      config.enabled
      && (
        !config.extension_id // For qa / qa2 profiles
        || (
          Array.isArray( config.extension_id )
          && config.extension_id.includes( Browser.runtime.id )
        )
      );
    if( !condition ) return 'DISABLED';

    const storageValue: boolean | undefined = await storage.get( 'useGa' );

    let useGa = ( () => {
      if( typeof storageValue === 'boolean' ) return storageValue;

      // Chance to be in GA tracking, from 0 to 1
      let chance/*: number*/ = config.chance || 0.01; // Use GA for only 1% of users to not exceed GA limits
      let use/*: boolean*/ = Math.random() < chance;

      storage.set( 'useGa', use );

      return use;
    })();

    return useGa ? 'TRACK' : 'FILTERED';
  })();


// Random GA user ID
const gaUserIdPromise/*: Promise<string | void>*/ = ( async() => {
  let sendType = await sendTypePromise;
  if( sendType !== 'TRACK' ) return;

  let id = await storage.get( 'gaUserId' );
  if( id ) return id;

  id = generateRfc4122Id();
  storage.set( 'gaUserId', id );

  return id;
})();


// Initial
( async() => {
  const gaUserId = await gaUserIdPromise;
  if( !gaUserId || !bgRequest ) return;

  request( gaUserId, { 'type': 'pageview' }); // One time at browser start
})();


/** @function */
const ga = Object.assign(
  async(
    { category, action, label, value, noninteraction }: {
      'category'?: string,
      'action'?: string,
      'label'?: string,
      'value'?: string,
      'noninteraction'?: boolean
    }
  ): Promise<any> => {
    if( !bgRequest ) {
      return sendMessage({
        'type': 'ga.partial',
        'data': { category, action, label, value, noninteraction }
      });
    }
  
    const sendType = await sendTypePromise;
    const gaUserId = await gaUserIdPromise;
  
    log(
      'GA',
        `[${sendType}]`,
        { category, action, label, value, noninteraction }
    );
  
    if( sendType !== 'TRACK' || !gaUserId ) return; // Flow crap
      
    await request(
      gaUserId,
      { 'type': 'event', action, category, label, noninteraction, value }
    );
  },
  {
    'isTrackedPromise': ( async() => {
      const sendType = await sendTypePromise;

      return sendType === 'TRACK';
    })()
  }
);

listeners( ga );


export default ga;
