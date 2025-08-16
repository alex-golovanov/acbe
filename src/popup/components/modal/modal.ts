import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { popupCloseIcon } from 'images';
import { hideModal } from 'popup/tools';

/**
 * @element `modal-container` - A modal component used to display content in a dialog box.
 *
 * @property {function} onClose - A callback function that will be called when the modal is closed.
 * @property {string} name - The name of the component that is using this modal. Used for identifying and closing the modal.
 */
@customElement('modal-container')
export class Modal extends LitElement {
  @property({ attribute: false })
    onClose: () => void = () => {};

  @property({ type: String })
    name: string = '';

  private async handleClose() {
    const animation = this.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 400,
      easing: 'linear',
    });
    await new Promise((resolve) => {
      animation.onfinish = resolve;
    });
    hideModal(this.name);
    this.onClose();
  }
  render() {
    return html` <div class="overlay" @click=${this.handleClose}></div>
      <div class="wrapper">
        <div class="close" @click=${this.handleClose}>${popupCloseIcon}</div>
        <slot></slot>
      </div>`;
  }

  static styles = css`
    :host {
      display: block;
      font-size: 14px;
      line-height: 1.3;
      color: var(--common-gray);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
    }

    :host > .overlay {
      position: absolute;
      top: 0px;
      right: 0px;
      bottom: 0px;
      left: 0px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.6);
    }

    .wrapper {
      position: absolute;
      top: 62px;
      right: 5px;
      bottom: 36px;
      left: 5px;
      border: 1px solid var(--lite-gray);
      border-radius: 5px;
      background: #fff;
      box-shadow: 4px 24px 32px 0px rgba(19, 35, 60, 0.25);
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      padding: 30px;
    }

    .close {
      position: absolute;
      top: 20px;
      right: 20px;
      cursor: pointer;
    }

    .close:hover svg path {
      fill: var(--brand-blue);
    }
  `;
}
