import ga from 'ga';
import jitsu from 'jitsu';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'type': 'popup-premium-onerule button click',
  'callback': async({ promotionId }: { 'promotionId'?: string }) => {
    ga.partial({ 'category': 'premium', 'action': 'click' });

    jitsu.track( 'premium_div_click', {
      'campaign': promotionId || 'default',
      'feature': 'smartsettings'
    });
  },
  'popupOnly': true
});

