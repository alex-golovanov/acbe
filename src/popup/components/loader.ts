import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LOADER_SPINNER } from './constants';

/**
 * @element loader-spinner
 *
 */
@customElement(LOADER_SPINNER)
export class LoaderSpinner extends LitElement {
  @property({ type: String }) size: 'small' | 'medium' | 'large' = 'medium';

  getSizeStyle() {
    switch (this.size) {
      case 'small':
        return 'width: 14px; height: 14px;';
      case 'large':
        return 'width: 50px; height: 50px;';
      case 'medium':
      default:
        return 'width: 25px; height: 25px;';
    }
  }

  render() {
    return html`
      <svg class="spinner" viewBox="0 0 50 50" style=${this.getSizeStyle()}>
        <circle
          class="path"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke-width="6"
        ></circle>
      </svg>
    `;
  }

  static styles = css`
    :host {
      display: flex;
    }

    .spinner {
      animation: rotate 1.4s linear infinite;
    }

    .path {
      stroke: var(--brand-blue, #1c304e);
      stroke-linecap: round;
      stroke-dasharray: 95, 150;
      stroke-dashoffset: 0;
      transform-origin: center;
    }

    @keyframes rotate {
      100% {
        transform: rotate(360deg);
      }
    }
  `;
}
