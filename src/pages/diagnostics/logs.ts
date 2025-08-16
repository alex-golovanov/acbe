import animateBodyScrollTop from './tools/animateBodyScrollTop';
import render from './logsTemplate';
import sendMessage from 'tools/sendMessage';
import { LitElement } from 'lit';


class Logs extends LitElement {
  logLoaded: boolean;
  text: string;
  visible: boolean;

  render() {
    return render.call( this );
  }
  static get properties() {
    return {
      'visible': { // Is log visible?
        'type': Boolean
      },
      'logLoaded': {
        'type': Boolean
      },
      'text': {
        'type': String
      }
    };
  }

  // Lifecycle
  constructor() {
    super();

    this.logLoaded = false;
    this.text = '';
    this.visible = false;
  }

  // Methods
  /** @method */
  async toggleLog() {
    let slideDown/*: boolean*/ = !this.visible;

    let promise/*: Promise<any>*/ = ( async() => {
      if( this.logLoaded ) {
        this.visible = !this.visible; return;
      }

      this.logLoaded = true;
      this.text = await sendMessage({ 'type': 'Diagnostics.getLog' });
      this.visible = !this.visible;
    })();
    if( !slideDown ) return;

    await promise;
    await this.requestUpdate(); // Re-render

    let scrollHeight/*: integer*/ = document.body.scrollHeight;
    let offsetHeight/*: integer*/ = document.body.offsetHeight;
    if( scrollHeight <= offsetHeight ) return;

    await new Promise( resolve => { setTimeout( resolve, 200 ); });

    animateBodyScrollTop( scrollHeight - offsetHeight, 750 );
  }

  /** @method */
  copy() {
    const textarea =
      this.shadowRoot?.querySelector?.( 'textarea[name="logs"]' ) as (
        HTMLTextAreaElement | null
      );
    if( !textarea ) {
      throw new Error( 'textarea element does not exist in Logs' );
    }

    textarea.select();
    document.execCommand( 'copy' );
    textarea.setSelectionRange( 0, 0 );
    textarea.blur();
  }
};
customElements.define( 'c-logs', Logs );


export default Logs;
