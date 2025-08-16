import onStartAction from 'bg/onStartAction';
import store from 'store';

if( typeof chrome !== 'undefined' ) {
  const controlledStates: readonly string[] = Object.freeze( [
    'controllable_by_this_extension', 'controlled_by_this_extension'
  ] );

  const handleProxyControlBrowserState = async({ levelOfControl }: { levelOfControl: string }) => {
    const controlBroken = !controlledStates.includes( levelOfControl );

    const { 'proxyIsBroken': oldState } = await store.getStateAsync();

    if( oldState === controlBroken ) return;

    store.dispatch({
      'type': 'Proxy is broken: set',
      'data': controlBroken
    });
  };

  const fetchAndHandleProxyControlState = async() => {
    const settings = await chrome.proxy.settings.get({ 'incognito': false });
    handleProxyControlBrowserState( settings );
  };

  chrome.proxy.settings.onChange.addListener( handleProxyControlBrowserState );
  onStartAction( fetchAndHandleProxyControlState );

  // alarm-interval check ?
  // on chrome.management.onEnabled ?
};
