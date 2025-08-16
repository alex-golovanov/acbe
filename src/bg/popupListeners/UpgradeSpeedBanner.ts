import ga from 'ga';
import jitsu from 'jitsu';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'callback': async() => {
    ga.partial({
      'category': 'banner',
      'action': 'click',
      'label': 'banner_speed_new'
    });

    jitsu.track( 'banner_click', { 'campaign': 'default' });
  },
  'type': 'upgrade speed banner: click',
  'popupOnly': true
});
