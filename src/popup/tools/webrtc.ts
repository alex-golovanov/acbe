import sendMessage from 'tools/sendMessage';


export default new class { // @ts-ignore
  available: boolean;

  constructor() {
    ( async() => {
      this.available = await sendMessage({ 'type': 'webrtc.available' });
    })();
  }

  /** @method */
  async disable( externalPermissionRequest?: () => Promise<void> ): Promise<void> {
    if( externalPermissionRequest ) await externalPermissionRequest();
    return sendMessage({ 'type': 'webrtc.disable' });
  }

  /** @method */
  async enable( externalPermissionRequest?: () => Promise<void> ): Promise<void> {
    if( externalPermissionRequest ) await externalPermissionRequest();
    return sendMessage({ 'type': 'webrtc.enable' });
  }

  /** @method */
  getControlState(): Promise<'not available' | 'permission not granted' | 'not controlled' | 'controlled'> {
    return sendMessage({ 'type': 'webrtc.getControlState' });
  }
}();
