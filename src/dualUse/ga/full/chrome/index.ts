import Browser from 'crossbrowser-webextension';
import gaUserIdPromise from '../gaUserIdPromise';
import mainConfig from 'config';
import log from 'log';
import request from './request';
import sendMessage from 'tools/sendMessage';


type GaArgument = {
  'category'?: string,
  'action'?: string,
  'label'?: string,
  'value'?: string,
  'noninteraction'?: boolean
};


const config = mainConfig.ga;
const bgRequest = location.href.includes( 'background' );


const condition: boolean =
  config.enabled
  && (
    !config.extension_id // For qa / qa2 profiles
    || (
      Array.isArray( config.extension_id )
      && config.extension_id.includes( Browser.runtime.id )
    )
  );


const ga: {
  ( arg: GaArgument ): Promise<any>;
  'userIdPromise': Promise<string>
} = Object.assign(
  async(
    { category, action, label, value, noninteraction }: GaArgument
  ) => {
    if( !bgRequest ) {
      return sendMessage({
        'type': 'ga.full',
        'data': { category, action, label, value, noninteraction }
      });
    }

    const type: 'TRACK' | 'DISABLED' = condition ? 'TRACK' : 'DISABLED';

    log(
      'GA full',
      `[${type}]`,
      { category, action, label, value, noninteraction }
    );
    if( type !== 'TRACK' ) return;
    
    
    const gaUserId = await gaUserIdPromise;
  
    return request(
      gaUserId,
      { 'type': 'event', action, category, label, noninteraction, value }
    );
  },
  { 'userIdPromise': gaUserIdPromise }
);


export default ga;
