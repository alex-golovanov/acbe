export default class { // @ts-ignore
  _oldValue: string;
  element: HTMLElement;

  constructor( element: HTMLElement | null ) {
    if( !element ) {
      throw new Error( 'AnimationElement argument is not Element' );
    }
    this.element = element;
  }

  set value( value: string ) { // eslint-disable-line accessor-pairs
    if( value === this._oldValue ) return;

    this._oldValue = value;
    this.element.style.cssText = value;
  }
};
