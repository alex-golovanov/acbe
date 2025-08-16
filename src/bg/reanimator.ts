import onStartAction from 'bg/onStartAction';
import storage from 'storage';


onStartAction( () => {
  storage.set( 'reanimator: in progress', false );
});
