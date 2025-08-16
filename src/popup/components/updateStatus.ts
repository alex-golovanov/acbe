import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { connect } from 'pwa-helpers/connect-mixin';

import jitsu from 'jitsu';
import store from 'store';
import sendMessage from 'tools/sendMessage';
import createTranslation from 'popup/tools/createTranslationObject';
import type { StoreState } from 'types/StoreState';
import type { StoreAccount, StoreGuestAccount } from 'types/StoreAccount';

import { UPDATE_STATUS } from './constants';

import 'popup/components/loader';

let translations: { [key: string]: string } = createTranslation({
  alreadyPremium: 'already_have_premium',
  turnOn: 'turn_it_on',
});

/**
 * @element `update-status` - Component for forced update of account data
 *
 */
@customElement(UPDATE_STATUS)
export class UpdateStatus extends connect(store as any)(LitElement) {
  @property({ attribute: false })
    closePopup: () => void = () => {};

  loading: boolean;
  user: StoreAccount;

  static get properties() {
    return {
      user: {
        type: Object,
      },
      loading: {
        type: Boolean,
      },
    };
  }

  // Store
  /** @method */
  stateChanged({ user }: StoreState): void {
    this.user = user;
  }

  // Lifecycle
  constructor() {
    super();
    this.user = { type: 'guest', premium: false } as StoreGuestAccount;
    this.loading = false;
  }

  isPremiumUser(): boolean {
    return this.user.type === 'logined' && this.user.premium;
  }

  // Go to login
  handleGuest() {
    this.closePopup();
    store.dispatch({ type: 'Page: set', page: 'login' });
    jitsu.track('signin');
  }

  // Reload the account data
  async handleNotYetPremium() {
    this.loading = true;
    const { loaded } = await sendMessage({ type: 'account.reload' });
    this.loading = !loaded;
  }
  // Common click handler
  turnOnPremium() {
    if (this.isPremiumUser()) {
      this.closePopup();
      jitsu.track('premium');
      return;
    }
    if (this.user.type === 'logined' && !this.user.premium) {
      this.handleNotYetPremium();
    } else {
      this.handleGuest();
    }
    jitsu.track('premium_div_other', { type: 'refresh' });
  }
  render() {
    if (this.isPremiumUser()) {
      this.closePopup();
    }

    return html`
      <div class="wrapper">
        <div class="question">${translations.alreadyPremium}</div>
        <div class="action" @click="${() => this.turnOnPremium()}">
          ${translations.turnOn}
          ${this.loading ? html`<loader-spinner size="small" />` : ''}
        </div>
      </div>
    `;
  }

  static styles = css`
    :host .wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      color: var(--brand-blue);
      padding: 2px 2px 0 2px;
    }

    .question {
      padding: 0 5px;
    }

    .action {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      text-decoration: underline;
      cursor: pointer;
      padding-right: 5px;
      min-width: 82px;
    }
  `;
}
