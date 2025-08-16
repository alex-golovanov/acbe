import ga from 'ga';
import jitsu from 'jitsu';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'type': 'popup-premium button click',
  'callback': async(
    { feature, promotionId }: {
      'feature': 'browser_tz' | 'countries',
      'promotionId'?: string
    }
  ) => {
    ga.partial({ 'category': 'premium', 'action': 'click' });
    ga.full({ 'category': 'locations_premium_div', 'action': 'button_click' });

    jitsu.track( 'premium_div_click', {
      'campaign': promotionId || 'default',
      feature
    });
  },
  'popupOnly': true
});

