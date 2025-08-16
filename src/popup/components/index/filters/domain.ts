import createTranslation from '../../../tools/createTranslationObject';
import globalStyle from '../../globalStyle';


const translations: { [ key: string ]: string } = createTranslation({
  'pleaseEnterDomain': 'please_enter_domain'
});


class FiltersDomain extends HTMLElement {
  _value: string; // @ts-ignore
  input: HTMLInputElement; // @ts-ignore
  inputValue: string;

  render() {
    // @ts-ignore
    const language = window.language as string;

    const shadowRoot = this.shadowRoot as ShadowRoot;

    const style = document.createElement( 'style' );
    style.textContent = `
    ${globalStyle}
    :host{
      display: block;
    }

    input[type="text"]{
      display: block;
      width: 100%;
      border: 1px solid #bcbcbc;
      line-height: 24px;
      height: 24px;
      box-sizing: border-box;
      padding: 0 8px;
      border-radius: 4px;
      outline: none;
    }
    input[type="text"]:focus{
      border-color: var( --brand-blue );
    }`;

    const input = document.createElement( 'input' );
    input.type = 'text';
    input.placeholder = translations.pleaseEnterDomain;

    input.addEventListener( 'input', ({ target }) => {
      let { value } = target as HTMLInputElement;
      value = value.replace( /\s+/g, '' ).toLowerCase();

      // Save caret position
      const end = input.selectionEnd as integer;
      input.value = value;

      const newEnd: integer = end > value.length ? value.length : end;
      input.setSelectionRange( newEnd, newEnd ); // Restore caret position

      this.inputValue = value;
      this._value = value;

      this.dispatchEvent( new CustomEvent(
        'value-changed', { 'detail': { value } }
      ) );
    });

    input.addEventListener( 'paste', ( event: ClipboardEvent ) => {
      event.stopPropagation(); // Stop data actually being pasted into div
      event.preventDefault();

      // Get pasted url via clipboard API
      // @ts-ignore
      const url: string = ( event.clipboardData || window.clipboardData )
        .getData( 'text/plain' ).trim();
      if( !url ) return;

      let value;
      try {
        value = ( new URL( url ) ).hostname;
      }
      catch ( e ) {
        value = url.toLowerCase();
      }

      this.dispatchEvent( new CustomEvent(
        'value-changed', { 'detail': { value } }
      ) );

      // TODO if not URL -> standard paste algorithm
    });

    input.addEventListener( 'keypress', ( event: KeyboardEvent ) => {
      let { code, which } = event;
      if( code !== 'Enter' && which !== 13 ) return;
      event.preventDefault();

      this.dispatchEvent( new CustomEvent( 'save' ) );
      input.blur();
    });

    this.input = input;

    shadowRoot.append( style, input );
  }

  // Lifecycle
  constructor() {
    super();

    this._value = '';
    this.inputValue = '';

    this.attachShadow({ 'mode': 'open' });
    this.render(); // Initial and only once
  }

  // Properties
  get value() {
    return this._value;
  }
  set value( newValue: string ) {
    const oldValue = this._value;

    if( newValue === oldValue ) return;

    this.inputValue = newValue;
    this._value = newValue;

    this.input.value = newValue; // <- actual render here
  }
}
customElements.define( 'filters-domain', FiltersDomain );
