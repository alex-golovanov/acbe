import runtimeOnMessage from 'bg/runtime.onMessage';
import ShowedOffers from 'bg/ShowedOffers';


runtimeOnMessage.addListener({
  'callback': ({ offer }) => ShowedOffers.includes( offer ),
  'type': 'ShowedOffers.includes',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': ({ offer }) => ShowedOffers.push( offer ),
  'type': 'ShowedOffers.push',
  'popupOnly': true
});
