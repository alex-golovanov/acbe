/* global Extension, LitUpdatedChanges */
import DiagnosticsCore from './tools/DiagnosticsCore';
import disableExtensions from './disableExtensions';
import render from './extensionsTemplate';
import { LitElement } from 'lit';


class Extensions extends LitElement {
  extensions: Extension[];
  views: Array<{
    'checked': boolean,
    'id': string,
    'name': string,
    'icon'?: string
  }>;

  render() {
    return render.call( this );
  }
  static get properties() {
    return {
      // States of steps (natural order)
      'extensions': {
        'type': Array
      },
      'views': {
        'type': Array
      }
    };
  }

  constructor() {
    super();

    this.extensions = [];
    this.views = [];
  }

  // Observers
  /** @method */
  // @ts-ignore
  updated( changes: LitUpdatedChanges<Extensions> ) {
    if( changes.has( 'extensions' ) ) {
      let views = this.views?.slice?.() || [];

      this.views = this.extensions.map( base => {
        let extension: any = Object.assign({}, base );

        let oldData = views.find( ({ id }) => id === extension.id );
        extension.checked = oldData?.checked ?? true;

        return extension;
      });
    }
  }

  // Methods
  /** @method */
  clickCheckbox( index: integer ) {
    return ({ target }: any ) => {
      let view = Object.assign({}, this.views[ index ] );
      let views = this.views.slice();

      view.checked = !view.checked;
      views[ index ] = view;

      this.views = views; // Render here
    };
  }

  /** @method */
  async disableExtensions() {
    // No selected extensions -> no actions
    if( !this.views.filter( ({ checked }) => checked ).length ) return;

    let extensions/*: ExtensionInfo[]*/ = await disableExtensions(
      this.views
        .filter( ({ checked }) => checked )
        .map( ({ id }) => id )
    );

    this.extensions = [];
    this.dispatchEvent(
      new CustomEvent( 'extensions-update', { 'detail': this.extensions })
    );

    // Recheck all again
    await DiagnosticsCore.terminate();
    DiagnosticsCore.start( extensions );
  }
};
customElements.define( 'c-extensions', Extensions );


export default Extensions;
