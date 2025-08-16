/* global PopupBanner */
import activeBanner from '../../../objects/activeBanner';
import DownloadablePromo from './DownloadablePromo'; // eslint-disable-line import/no-duplicates
import ga from 'ga';
import globalStyle from '../../globalStyle';
import jitsu from 'jitsu';
import storage from 'storage';
import store from 'store';
import { html, render } from 'lit/html.js';
import { experimentsHelper } from 'experiments';

// TS crap:
import './DownloadablePromo'; // eslint-disable-line import/no-duplicates
import './PremiumExpirationSoon';
import './UpgradeSpeedBanner';

const { _ } = self;


class IndexHomePromo extends HTMLElement {
  _activeBanner: PopupBanner | null;

  // Lifecycle
  constructor() {
    super();

    this._activeBanner = null;

    this.expirationClose = this.expirationClose.bind( this );

    const shadowRoot = this.attachShadow({ 'mode': 'open' });

    const template = html`
    <style>
    ${globalStyle}
    :host{
      display: block;
      height:82px;
    }
    </style>`;

    // Initial render
    render( template, shadowRoot );
  }

  // Properties
  get activeBanner() {
    return this._activeBanner;
  }
  set activeBanner( value: PopupBanner | null ) {
    if( _.isEqual( this._activeBanner, value ) ) return;

    this._activeBanner = value;
    this.renderActivePromo( this.activeBanner );
  }

  // Methods
  /** @method */
  async expirationClose() {
    const { user } = await store.getStateAsync();
    const paidUntil = user.loginData?.subscription?.paidUntil;
    if( !paidUntil ) return;

    let untilDate = new Date( paidUntil );
    await storage.set( 'userClosedWarnToPremiumEndDate', String( untilDate ) );

    activeBanner.refresh();
  }

  /** @method */
  async renderActivePromo( activeBanner: PopupBanner | null ) {
    const shadowRoot = this.shadowRoot as ShadowRoot;

    const storeState = await store.getStateAsync();

    for( const element of shadowRoot.children ) {
      if( element.tagName.toLowerCase() !== 'style' ) element.remove();
    }

    const element: HTMLElement | undefined = await ( async() => {
      if( !activeBanner ) return undefined;

      if( activeBanner.type === 'premium expiration' ) {
        const element = document.createElement( 'premium-expiration-soon' );
        element.addEventListener( 'expirationclose', this.expirationClose );

        return element;
      }

      if( activeBanner.type === 'custom' ) {
        const element =
          document.createElement( 'downloadable-promo' ) as DownloadablePromo;
        const { promotionId, 'banner': { link, structure } } = activeBanner;

        jitsu.track( 'banner', { 'campaign': promotionId });

        const expvarid = await experimentsHelper.getEngagedEnabledExpvarid();

        const urlObject = new URL( link );
        urlObject.searchParams.set( 'instd', String( storeState.daysAfterInstall ) );
        if( expvarid ) {
          urlObject.searchParams.set( 'expvarid', expvarid );
        }

        element.renderDomFromJson({
          'jsonStructure': structure,
          'link': urlObject.toString(),
          promotionId
        });

        return element;
      }

      if( activeBanner.type === 'speed' ) {
        jitsu.track( 'banner', { 'campaign': 'default' });

        return document.createElement( 'upgrade-speed-banner' );
      }
    })();
    if( element ) shadowRoot.append( element );

    // GA show event
    if( activeBanner?.type === 'custom' ) {
      const { promotionId } = activeBanner;

      ga.partial({
        'category': 'banner',
        'action': 'show',
        'label': 'banner_promo_' + promotionId
      });
    }
    if( activeBanner?.type === 'speed' ) {
      ga.partial({
        'category': 'banner',
        'action': 'show',
        'label': 'banner_speed_new'
      });
    }
  }
};
customElements.define( 'index-home-promo', IndexHomePromo );


export default IndexHomePromo;
