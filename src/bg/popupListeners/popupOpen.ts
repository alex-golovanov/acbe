import account from 'bg/account';
import Counters from 'bg/Counters';
import promotions from 'bg/promotions';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'callback': async() => {
    promotions.setPrices();

    Counters.increase( 'icon clicks' );

    // On each popup open every 5 minutes load account to check
    account.load();
  },
  'type': 'popup open',
  'popupOnly': true
});
