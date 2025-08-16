// NOTE: in fact works only in Chrome!
import Browser from 'crossbrowser-webextension';


const permissions = new class {
  listeners: Array<( permissions: string[] ) => any>;
  _state: string[];
  ready: Promise<void>;

  constructor() {
    this._state = [];
    this.listeners = [];

    this.ready = ( async() => {
      let { permissions } = await Browser.permissions.getAll();

      this._state = permissions;
    })();
  }

  /** @method */
  async get(): Promise<string[]> {
    await this.ready;
    return this._state.slice();
  }

  /** @method */
  async includes( permission: string ): Promise<boolean> {
    await this.ready;
    return this._state.includes( permission );
  }

  /** @method */
  set( value: string[] ): void {
    this._state = value.slice();
  }

  /** @method */
  addListener( listener: ( permissions: string[] ) => any ): void {
    this.listeners.push( listener );
  }

  /** @method */
  removeListener( listener: ( permissions: string[] ) => any ): void {
    this.listeners = this.listeners.filter( item => item !== listener );
  }
}();


/** @function */
let permissionsListener = async() => {
  let { 'permissions': list } = await Browser.permissions.getAll();

  permissions.set( list );
  permissions.listeners.forEach( listener => { listener( list ); });
};

Browser.permissions.onAdded?.addListener?.( permissionsListener );
Browser.permissions.onRemoved?.addListener?.( permissionsListener );


export default permissions;
