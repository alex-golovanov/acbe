import sendMessage from 'tools/sendMessage';


const _browser = typeof browser !== 'undefined' ? browser : chrome;


export default new class {
  _callbacks: Array<( permissions: string[] ) => any>;
  _state: string[];

  constructor() {
    this._state = [];
    this._callbacks = [];

    let port = _browser.runtime.connect({ 'name': 'permissions' });

    port.onMessage.addListener( ( newState: string[] ) => {
      this._state = newState;
      this._callbacks.forEach( callback => { callback( newState ); });
    });

    ( async() => {
      this._state = await sendMessage({ 'type': 'permissions.get' });
    })();
  }

  /** @method */
  addListener( callback: ( permissions: string[] ) => any ): void {
    this._callbacks.push( callback );
  }

  /** @method */
  get(): string[] {
    return this._state;
  }

  /** @method */
  includes( permission: string ): boolean {
    return this._state.includes( permission );
  }
}();
