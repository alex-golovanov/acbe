import IndexHome from './home';
import { homeStatusActive } from 'popup/components/index/home/HomeStatusActive';
import { homeStatusInactive } from 'popup/components/index/home/HomeStatusInactive';
import { html } from 'lit';

export default function( this: IndexHome ) {
  const { switchesView, proxyEnabled, enableProxy, language, activeBanner } = this;

  // due to 3 states of the widget, we need not only check if proxy enabled, but also view is simple (without "smarts")
  const disabled = !proxyEnabled && switchesView.type === 'simple';

  return html`
    <style>
      .block {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: transform 0.25s ease, opacity 0.30s ease;
      }

      :host(.withPromo) > .block {
        top: 28px;
      }

      .promo {
        display: none;
      }

      :host(.withPromo) > .promo {
        display: block;
        position: relative;
        z-index: 1;
      }

      /* To show block you add this class to the block*/
      .active {
        transform: translateX(0);
        opacity: 1;
      }

      /* To hide block you add this class to the block that is responsible for enabled state*/
      .inactive_enabled {
        transform: translateX(400px);
        opacity: 0;
      }

      /* To hide block you add this class to the block that is responsible for disabled state*/
      .inactive_disabled {
        transform: translateX(-400px);
        opacity: 0;
      }

    </style>

    <div class="promo">
      <index-home-promo .activeBanner="${activeBanner}"></index-home-promo>
    </div>

    <div class="block ${disabled ? 'active' : 'inactive_disabled'}">
      ${homeStatusInactive({
        enableProxy,
        language
      })}
    </div>
    <div class="block ${!disabled ? 'active' : 'inactive_enabled'}">
      ${homeStatusActive( this )}
    </div>
  `;
}
