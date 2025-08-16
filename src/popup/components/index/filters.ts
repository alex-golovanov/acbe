/* global SiteFilter, StoreState, VisibleFilter */
import createTranslation from '../../tools/createTranslationObject';
import FiltersCountryList from './filters/country-list';
import ga from 'ga';
import highLevelPac from 'highLevelPac';
import PopupPremiumOneRule from '../popups/premium-onerule';
import punycode from 'punycode'; // eslint-disable-line n/no-deprecated-api
import render from './filtersTemplate';
import sendMessage from 'tools/sendMessage';
import store from 'store';
import TooltipError from '../tooltip-error';
import { LitElement, PropertyValues } from 'lit';
import { connect } from 'pwa-helpers/connect-mixin';
import './filters/domain';

const { _ } = self;
const _browser = typeof browser !== 'undefined' ? browser : chrome;


type AdditionFilter = {
  'country'?: string,
  'domain': string,
  'type': 'proxy' | 'direct'
};


const translations: { [ key: string ]: string } = createTranslation({
  'off': 'off',
  'on': 'on',
  'pleaseEnterDomain': 'please_enter_domain',
  'pleaseEnterValidDomain': 'please_enter_valid_domain',
  'removeSmartSetting': 'remove_smart_setting',
  'select': 'select',
  'settingWasDeleted': 'setting_was_deleted',
  'thisDomainAlreadyInList': 'this_domain_already_in_list',
  'undo': 'undo',
  'use': 'use'
});

/** For sorting filters by alphabet
@function */
const alphabetFiltersSorting = (
  { 'view': a }: VisibleFilter,
  { 'view': b }: VisibleFilter
) => {
  if( a < b ) return -1;
  if( a > b ) return 1;
  return 0;
};

/** @function */
const showErrorTooltip = (
  { dimensionElement, text }:
  { dimensionElement: HTMLElement, text: string }
): void => {
  const tooltipElement =
    document.createElement( 'tooltip-error' ) as TooltipError;
  tooltipElement.text = text;

  const rect = dimensionElement.getBoundingClientRect();
  const top = rect.top + dimensionElement.offsetHeight - 1;

  tooltipElement.style.cssText = `top:${top}px;left:${rect.left}px;`;
  document.body.append( tooltipElement );

  const listener = ( () => {
    let first = true;

    return () => {
      if( first ) {
        first = false;
        return;
      }

      tooltipElement.remove();
      document.removeEventListener( 'click', listener );
    };
  })();
  document.addEventListener( 'click', listener );
};


class IndexFilters extends connect( store as any )( LitElement ) {
  countries: string[];
  country: string | null; // @ts-ignore
  countryElement: HTMLElement;
  documentClick?: ( arg: MouseEvent ) => any;
  domain: string; // @ts-ignore
  domainInput: HTMLElement;
  filters: VisibleFilter[];
  language: string; // @ts-ignore
  nodes: { 'list': HTMLElement }; // @ts-ignore
  popupPremiumFreeze: boolean;
  premium: boolean | null;
  removeStoreListener?: () => any;
  selectedDomain: string | null;

  render() {
    return render.call( this, translations );
  }

  static get properties() {
    return {
      'country': { // Country in flag select
        'type': String
      },
      'countries': {
        'type': Array
      },
      'domain': { // Input:text with domain
        'type': String
      },
      'filters': {
        'type': Array
      },
      'premium': {
        'type': Boolean
      },
      'selectedDomain': { // Used to split 'add' mode and 'modify' mode
        'type': String
      }
    };
  }

  // Lifecycle
  constructor() {
    super();

    this.countries = [];
    this.country = null;
    this.domain = '';
    this.filters = [];
    this.premium = null;
    this.selectedDomain = null;

    // @ts-ignore
    this.language = window.language as string;
  }

  /** @method */
  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeStoreListener?.();
    delete this.removeStoreListener;

    if( !this.documentClick ) return;
    document.removeEventListener( 'mousedown', this.documentClick );
  }

  /** @method */
  async firstUpdated( changedProperties: PropertyValues<any> ) {
    super.firstUpdated( changedProperties );

    const shadowRoot = this.shadowRoot as ShadowRoot;
    const list = shadowRoot.querySelector( 'div.List' ) as ( HTMLElement | null );
    if( !list ) throw new Error( 'No list element in index-filters' );

    this.nodes = { list };

    const { userPac } = store.getStateSync();

    // Loading list of filters
    {
      const filters: VisibleFilter[] = [];
      for( const item of userPac.filters ) {
        if( item.format !== 'domain' ) continue; // No RegExp

        const country = item.proxyMode ? item.country : null;
        const { disabled, value } = item;

        const view: string = punycode.toUnicode( value );

        filters.push({
          country,
          'deleted': false,
          disabled,
          value,
          view
        });
      }

      this.filters = filters.sort( alphabetFiltersSorting ); // Alphabet sorting
    }

    // Nodes
    const domainInput =
      shadowRoot.querySelector( 'div.ChangeRule filters-domain' ) as (
        HTMLElement | null
      );
    if( !domainInput ) {
      throw new Error( 'No domainInput element in index-filters' );
    }
    this.domainInput = domainInput;

    const countryElement =
      shadowRoot.querySelector( '[data-role="country selector"]' ) as (
        HTMLElement | null
      );
    if( !countryElement ) {
      throw new Error( 'No countryElement element in index-filters' );
    }
    this.countryElement = countryElement;

    // Listener to changes of filters.length
    this.removeStoreListener = store.onChange(
      ({ 'userPac': { filters } }: StoreState ): SiteFilter[] => filters,
      async( listNew: SiteFilter[], listOld: SiteFilter[], storeState ) => {
        if( listNew.length === listOld.length ) return;

        const action =
          listNew.length > listOld.length ? 'addition' : 'deletion';

        if( action === 'addition' ) {
          const filter = _.differenceBy( listNew, listOld, _.isEqual as any )[ 0 ];
          if( !filter ) return;

          const hasFilter =
            this.filters.some( ({ value }) => value === filter.value );
          if( hasFilter ) return;

          const filters = _.cloneDeep( this.filters );
          if( typeof filter.value !== 'string' ) {
            throw new Error(
              'Addition error for index-filters, not string provided before punicode'
            );
          }
          const view = punycode.toUnicode( filter.value );

          filters.push({
            'country': filter.country,
            'deleted': false,
            'value': filter.value,
            view
          });

          this.filters = filters.sort( alphabetFiltersSorting ); // Render here
          return;
        }

        if( action === 'deletion' ) {
          const userLogined = Boolean( storeState.user.email );

          // Logout
          const condition =
            !userLogined
            && !listNew.length
            && listOld.length - listNew.length >= 2;
          if( condition ) {
            this.filters = []; // Render here
            return;
          }

          const filter = _.differenceBy( listOld, listNew, _.isEqual as any )[ 0 ];
          if( !filter ) return;

          const hasFilter: boolean = this.filters.some(
            ({ deleted, value }) => value === filter.value && !deleted
          );
          if( !hasFilter ) return;

          const filters = _.cloneDeep( this.filters )
            .filter( ({ value }) => value !== filter.value );
          this.filters = filters; // Render here
        }
      }
    );
  }

  /** @method */
  stateChanged({ proxyServers, user }: StoreState ): void {
    this.countries = Array.from(
      user.premium
        ? proxyServers.premiumCountries()
        : proxyServers.freeCountries()
    );
    this.premium = user.premium;
  }

  // Methods
  /** @method */
  cancelRemove({ country, value }: VisibleFilter )/*: Function*/ {
    return () => {
      const condition =
        this.filters.some( ({ deleted, disabled }) => !deleted && !disabled )
        && !store.getStateSync().user.premium;
      if( condition ) { // Premium popup show condition
        this.showPremiumPopup();
        return;
      }

      const filters = _.cloneDeep( this.filters );
      const deletedFilter = filters.find( item => item.value === value );
      if( deletedFilter ) deletedFilter.deleted = false;
      this.filters = filters; // Render here

      const data: AdditionFilter =
        { 'domain': value, 'type': country ? 'proxy' : 'direct' };
      if( country ) data.country = country;

      highLevelPac.siteFilters.add( data );
    };
  }

  /** @method */
  inputListener({ 'detail': { value } }: { 'detail': { 'value': string } }) {
    this.domain = value;
  }

  /** @method */
  listClick({ target }: MouseEvent ) {
    // if( target === this.nodes.list ) this.resetSelection();
  }

  /** @method */
  listElementClick(
    { country, disabled, value, view }: VisibleFilter
  )/*: Function*/ {
    return ({ target }: MouseEvent ) => {
      if( !( target instanceof HTMLElement ) ) return;

      // Remove click
      if( target.classList.contains( 'List_Remove' ) ) {
        const filters: VisibleFilter[] = _.cloneDeep( this.filters );
        const filter: VisibleFilter | undefined =
          filters.find( item => item.value === value );
        if( filter ) filter.deleted = true;
        this.filters = filters; // Render here

        highLevelPac.siteFilters.remove( value );

        this.resetSelection();
        return;
      }

      // Select disabled click
      if( target.classList.contains( 'List_Select_Button' ) ) {
        { // Popup part
          const filters: VisibleFilter[] = _.cloneDeep( this.filters );
          {
            const filter = filters.find( ({ disabled }) => !disabled );
            if( filter ) filter.disabled = true;
          }
          {
            const filter: VisibleFilter | undefined = filters.find(
              ({ 'value': ownDomain }) => value === ownDomain
            );
            if( filter ) delete filter.disabled;
          }

          this.filters = filters; // Render here
        }

        // Internal extension part
        sendMessage({ 'type': 'select disabled site filter', value });
        return;
      }

      // Disabled element
      if( disabled ) {
        this.resetSelection();
        return;
      }

      // Activate click
      this.country = country;
      this.domain = view;
      this.selectedDomain = value;
    };
  }

  /** @method */
  async openCountryList(): Promise<void> {
    const { ping, user } = await store.getStateAsync();

    this.countryElement.classList.add( 'open' );

    const element =
      document.createElement( 'filters-country-list' ) as FiltersCountryList;

    const countries = this.countries
      .map( ( countryCode ): {
        'code': string,
        'mark': number| undefined,
        'name': string
      } => {
        const mark = ping.find(
          ({ country, premium }) => (
            country === countryCode && premium === user.premium
          )
        )?.mark;
        const name =
          _browser.i18n.getMessage( 'country_' + countryCode );

        return {
          'code': countryCode, mark, name
        };
      })
      .sort( ({ 'name': a }, { 'name': b }) => {
        if( a < b ) return -1;
        if( a > b ) return 1;
        return 0;
      });

    element.countries = countries;
    element.country = this.country;

    element.addEventListener(
      'select', // @ts-ignore
      ({ 'detail': country }: { 'detail': string }) => {
        this.country = country;
        this.countryElement.classList.remove( 'open' );
      }
    );
    element.addEventListener( 'disable', () => {
      this.country = null;
      this.countryElement.classList.remove( 'open' );
    });

    const { 'left': offsetLeft, 'top': offsetTop }: {
      'left': integer, 'top': integer
    } = this.countryElement.getBoundingClientRect();

    const offsetHeight: integer = this.countryElement.offsetHeight;
    const top: integer = offsetTop + offsetHeight;
    const right: integer =
      self.innerWidth - offsetLeft - this.countryElement.offsetWidth;
    const height: integer = self.innerHeight - offsetTop - offsetHeight;

    element.style.cssText =
      `top:${top}px;right:${right}px;max-height:${height}px;`;

    document.body.append( element );

    ( async() => {
      if( !this.country ) return;

      await element.updateComplete;

      const index =
        countries.findIndex( ({ code }) => code === this.country ) || 0;

      const shadowRoot = element.shadowRoot as ShadowRoot;
      const countryElement =
        Array.from( shadowRoot.children ).filter( element => (
          element.tagName.toLowerCase() === 'div'
          && element.classList.contains( 'E' )
        ) )[ index ] as HTMLElement;

      const goalScrollTop = countryElement.offsetTop - countryElement.offsetHeight;
      const countryElementVisible: boolean =
        countryElement.offsetTop + countryElement.offsetHeight <= element.offsetHeight;
      if( countryElementVisible ) return;

      element.scrollTop = goalScrollTop;
    })();

    this.documentClick = ({ target }: MouseEvent ) => {
      // Click on element
      if( target instanceof HTMLElement && ( element.contains( target ) || target === element ) ) {
        return; // Do nothing in case of click on element but not .E
      }

      element.remove();
      if( !this.documentClick ) return;

      document.removeEventListener( 'mousedown', this.documentClick );
      delete this.documentClick;
      this.countryElement.classList.remove( 'open' );
    };

    document.addEventListener( 'mousedown', this.documentClick );
  }

  /** @method */
  resetSelection(): void {
    this.country = null;
    this.domain = '';
    this.selectedDomain = null;
  }

  /** Add or modify filter
  @method */
  async save(): Promise<void> {
    // visible form for domain (for user)
    const domainView: string = this.domain;

    // Check for value existence
    if( !domainView ) {
      showErrorTooltip({
        'dimensionElement': this.domainInput,
        'text': translations.pleaseEnterDomain
      });
      return;
    }

    // punycode converted form for domain
    const domain: string | undefined = punycode.toASCII( domainView );
    if( typeof domain === 'undefined' ) return; // Crap from punycode case


    // Check for correct domain parts count
    if( domain.split( '.' ).length === 1 ) {
      showErrorTooltip({
        'dimensionElement': this.domainInput,
        'text': translations.pleaseEnterValidDomain
      });
      return;
    }

    { // Check for correct domain
      const parts: string[] = domain.split( '.' );

      const isIp: boolean =
        parts.length === 4
        && parts.every( part => (
          /^[0-9]+$/.test( part ) && Number( part ) >= 0 && Number( part ) <= 255
        ) );
      const hasErrors: boolean =
        !isIp && parts.some( part => !/^[a-zA-Z0-9-_]+$/.test( part ) );

      if( hasErrors ) {
        showErrorTooltip({
          'dimensionElement': this.domainInput,
          'text': translations.pleaseEnterValidDomain
        });
        return;
      }

      if( !isIp ) { // Check for correct domain zone
        const zone = domain.split( '.' ).pop() as string; // @ts-ignore
        if( !self.domainZoneList.includes( zone ) ) {
          showErrorTooltip({
            'dimensionElement': this.domainInput,
            'text': translations.pleaseEnterValidDomain
          });
          return;
        }
      }
    }

    // Check for doubles
    if( !this.selectedDomain ) {
      const domains/*: string[]*/ = this.filters.map( ({ value }) => value );
      if( domains.includes( domain ) ) {
        showErrorTooltip({
          'dimensionElement': this.domainInput,
          'text': translations.thisDomainAlreadyInList
        });
        return;
      }
    }

    const storeState = await store.getStateAsync();

    // Addition
    if( !this.selectedDomain ) {
      const condition =
        this.filters.some( ({ deleted, disabled }) => !deleted && !disabled )
        && !storeState.user.premium;
      if( condition ) { // Premium popup show condition
        this.showPremiumPopup();
        return;
      }

      sendMessage({
        'type': 'counters.increase',
        'property': 'popup: smart settings: add rule'
      });

      const filter: AdditionFilter = this.country
        ? { 'country': this.country, domain, 'type': 'proxy' }
        : { domain, 'type': 'direct' };

      // Popup part
      const filters: VisibleFilter[] = this.filters.slice();
      filters.unshift({
        'country': this.country,
        'deleted': false,
        'value': domain,
        'view': domainView
      });
      this.filters = filters;

      // Internal extension part
      highLevelPac.siteFilters.add( filter );
    }

    // Modification
    else {
      { // Popup part
        const filters: VisibleFilter[] = this.filters
          .filter( ({ value }) => value !== this.selectedDomain );

        filters.push({
          'country': this.country,
          'deleted': false,
          'value': domain,
          'view': domainView
        });
        filters.sort( alphabetFiltersSorting );

        this.filters = filters;
      }

      // Internal extension part
      sendMessage({
        'type': 'change site filter',
        'country': this.country,
        domain,
        'selectedDomain': this.selectedDomain
      });
    }

    // After successfull addition/modification
    this.resetSelection();
  }

  /** @method */
  async showPremiumPopup() {
    if( this.popupPremiumFreeze ) return;

    this.popupPremiumFreeze = true;

    const popupPremium =
      document.createElement( 'popup-premium-onerule' ) as PopupPremiumOneRule;
    popupPremium.style.cssText = 'top:-100%;';

    document.body.append( popupPremium );

    ga.partial({ 'category': 'premium', 'action': 'show' });

    const animation = popupPremium.animate(
      [
        { 'top': '-100%' },
        { 'top': '0' }
      ],
      { 'duration': 800, 'easing': 'linear' }
    );
    await new Promise( resolve => { animation.onfinish = resolve; });

    popupPremium.style.cssText = '';
    this.popupPremiumFreeze = false;
  }
};
customElements.define( 'index-filters', IndexFilters );


export default IndexFilters;
