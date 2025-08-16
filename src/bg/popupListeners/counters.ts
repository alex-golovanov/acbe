import Counters from 'bg/Counters';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'callback': ({ property }) => {
    Counters.increase( property );
  },
  'type': 'counters.increase',
  'popupOnly': true
});
