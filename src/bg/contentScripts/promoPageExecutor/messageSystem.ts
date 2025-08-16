/* global Promotion */
import ga from 'ga';
import jitsu from 'jitsu';
import onMessage from 'bg/runtime.onMessage';
import store from 'store';
import { experimentsHelper } from 'experiments';


onMessage.addListener({
  'type': 'promo page: get information',
  'callback': async({ url }: { 'url': string }) => {
    const storeState = await store.getStateAsync();
    const { daysAfterInstall, promotions } = storeState;

    const expvarid = await experimentsHelper.getEngagedEnabledExpvarid();

    const promotion = promotions.find( ({ page }) => page === url );

    return { daysAfterInstall, expvarid, promotion };
  }
});

onMessage.addListener({
  'type': 'promo page: click',
  'callback': async({ promotion } : { 'promotion'?: Promotion }) => {
    const isTracked = await ga.partial.isTrackedPromise;
    if( isTracked ) {
      ga.partial({ 'category': 'promotab', 'action': 'click' });
    }

    const extraData = {
      'campaign': 'default'
    };
    if( promotion ) {
      Object.assign( extraData, {
        'campaign': promotion.id,
        'pageActive': promotion.pageActive ? '1' : '0',
        'scope': promotion.pageScope || 'all'
      });
    }

    jitsu.track( 'promo_tab_click', extraData );
  }
});
