/* global Credentials, StoreState */
import ajaxes from 'ajaxes';
import Browser from 'crossbrowser-webextension';
import log from 'log';
import onStartAction from 'bg/onStartAction';
import store from 'store';


interface PrivacyNetwork{
  'webRTCIPHandlingPolicy': {
    'get': () => Promise<{ 'levelOfControl': string }>,
    'set': ( arg: { 'value': any }) => Promise<any>
  }
};

type ControlState =
  'not available' | 'permission not granted' | 'not controlled' | 'controlled';


const constrolStates: readonly string[] = Object.freeze( [
  'controllable_by_this_extension', 'controlled_by_this_extension'
] );

let whenWebrtcAvailable: Promise<boolean> = ( async() => {
  if( typeof browser !== 'undefined' ) {
    let { version }: { 'version': string } =
      await Browser.runtime.getBrowserInfo();
    let majorVersion: integer = Number( version.split( '.' )[ 0 ] );

    return majorVersion > 55;
  }

  try {
    new ImageData( 100, 100 );
    return true;
  }
  catch ( error ) {
    return false;
  }
})();


/** Do we have control over WebRTC settings
@function */
const getControlState = async(): Promise<ControlState> => {
  let webrtcAvailable: boolean = await whenWebrtcAvailable;
  if( !webrtcAvailable ) return 'not available';

  let { permissions }: { 'permissions': string[] } =
    await Browser.permissions.getAll();
  if( !permissions.includes( 'privacy' ) ) return 'permission not granted';

  if( Browser.privacy === undefined ) {
    Browser.resetAPI( 'privacy' );
  }

  let network: PrivacyNetwork = Browser.privacy.network;

  let { levelOfControl }: { 'levelOfControl': string } =
    await network.webRTCIPHandlingPolicy.get();

  return (
    constrolStates.includes( levelOfControl )
      ? 'controlled'
      : 'not controlled'
  );
};

/** @function */
const storeWebrtcBlock = ( value: boolean ): void => {
  store.dispatch({ 'type': 'WebRTC blocking: set', 'data': value });

  let { user } = store.getStateSync();
  if( user.type === 'guest' ) return;

  let credentials: Credentials = user.loginData.credentials;
  if( credentials ) ajaxes.setWebrtcBlock({ credentials, 'webrtcBlock': value });
};


let webRtc = new class {
  /** @private @method */
  async _setWithPermissionRequest( protection: boolean ): Promise<void> {
    Browser.resetAPI( 'privacy' ); // Eternal privacy permission will not update API !
    await this.set( protection );
  }

  /** Disable protection and deactivate it
  @method */
  async disable(): Promise<void> {
    await this._setWithPermissionRequest( false );
    storeWebrtcBlock( false );
  }

  /** Enable protection and activate it if proxy enabled
  @method */
  async enable(): Promise<void> {
    let { userPac } = await store.getStateAsync();
    let proxyEnabled: boolean = userPac.mode === 'proxy';
    await this._setWithPermissionRequest( proxyEnabled );
    storeWebrtcBlock( true );
  }

  /** @method */
  async get(): Promise<boolean | null> {
    let { webrtcBlock } = await store.getStateAsync();
    return webrtcBlock;
  }

  /** @method */
  getControlState(): Promise<(
    'not available' | 'permission not granted' | 'not controlled' | 'controlled'
  )> {
    return getControlState();
  }

  /** @method */
  isAvailable(): Promise<boolean> {
    return whenWebrtcAvailable;
  }

  /** Set actual WebRTC
  @method
  @param protection - true -> block WebRTC */
  async set( protection: boolean ): Promise<void> {
    let controlState: ControlState = await getControlState();
    if( controlState !== 'controlled' ) {
      throw new Error( 'WebRTC settings are controlled by another extension' );
    }

    if( Browser.privacy === undefined ) {
      Browser.resetAPI( 'privacy' );
    }

    let network: PrivacyNetwork = Browser.privacy.network;

    // Chrome 48+ & FF 54+
    let value = await ( async() => {
      if( !protection ) return 'default';

      // Chrome
      if( typeof browser === 'undefined' ) return 'disable_non_proxied_udp';

      // FF
      let { version }: { 'version': string } =
        await Browser.runtime.getBrowserInfo();
      let versionNumber = Number( version.split( '.' )[ 0 ] );

      return versionNumber >= 70 ? 'proxy_only' : 'disable_non_proxied_udp';
    })();

    await network.webRTCIPHandlingPolicy.set({ value });
  }
}();


store.onChange(
  ({ 'userPac': pac }: StoreState ) => pac.mode === 'proxy',
  async( proxyEnabled: boolean ) => {
    let blocking: boolean | null = await webRtc.get();
    if( !blocking ) return;

    try {
      await webRtc.set( proxyEnabled );
    }
    catch ( error ) {}
  }
);


// Initial
onStartAction( async() => {
  let block: boolean | null = await webRtc.get();
  if( block === null ) return;

  // Try to set settings again on every startup
  let controlState: ControlState = await webRtc.getControlState();
  if( controlState !== 'controlled' ) return;


  try {
    if( block ) await webRtc.enable();
    else await webRtc.disable();
  }
  catch ( error ) {
    log.warn( 'Initial WebRTC setup failed' );
  }
});


export default webRtc;
