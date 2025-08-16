/* global SiteFilter, TreeElement */
import browsecLink from 'bg/browsecLink';
import changeLinkDeepLoop from './changeLinkDeepLoop';
import findMatchingFilterForDomain from 'tools/findMatchingFilterForDomain';
import ga from 'ga';
import getUserLanguage from 'tools/getUserLanguage';
import internationalize from 'tools/internationalize';
import jitsu from 'jitsu';
import log from 'log';
import onMessage from 'bg/runtime.onMessage';
import pageLinks from 'pageLinks';
import pricesPreView from 'tools/pricesPreView';
import storage from 'storage';
import store from 'store';
import translation from './translation';
import translationReplaceCrawler from './translationReplaceCrawler';
import urlToDomain from 'tools/urlToDomain';

import { PAC_MODE } from 'constants/common';
import { sendMessageToContent } from 'bg/utils';
import { NOTIFICATIONS } from 'constants/messages/notifications';
import { checkUrlInList } from './utils';
import { experimentsHelper } from 'experiments';

/** All possible languages for translation */
const languages: string[] = translation.map( ({ language }) => language );


/** Initial call to get status + all translations */
onMessage.addListener({
  'type': NOTIFICATIONS.requestInitial,
  'callback': async(
    { language, url }: { 'language': string, 'url': string }
  ): Promise<{
    'html'?: TreeElement[],
    'proxyEnabled'?: boolean,
    'promotionId'?: string,
    'readyToShow': boolean,
    'size'?: 'big' | 'small'
  }> => {
    const domain: string = urlToDomain( url ) || '';
    const secondLevelDomain: string =
      domain.split( '.' ).slice( -2 ).join( '.' );

    const userLanguage = getUserLanguage();

    if( ![ 'en', 'ru' ].includes( language ) ) language = 'en';

    const storeState = await store.getStateAsync();

    // Is user premium?
    const premium = storeState.user.premium;

    // Are promotions blocked?
    const promotionsBlock = storeState.promotionsBlock;

    // Is proxy enabled
    const proxyEnabled = ( () => {
      const { mode, filters } = storeState.userPac;
      if( !domain ) return false;

      const filter: SiteFilter | undefined =
        findMatchingFilterForDomain( filters, domain );
      if( filter ) return filter.proxyMode;

      return mode === 'proxy';
    })();

    let { currency, duration, oldPrice, price, priceString, trialDays } = pricesPreView({
      'language': userLanguage,
      'prices': storeState.prices,
      'priceTrial': storeState.priceTrial
    });

    const discount/*: integer*/ = !oldPrice
      ? 0
      : Math.floor( 100 * ( oldPrice - price ) / oldPrice );

    // Do we need to show popup?
    const readyToShow/*: boolean*/ = !premium && !promotionsBlock;

    log(
      'Notification. ready to Show: ',
      readyToShow,
      '. Proxy: ',
      proxyEnabled,
      '. Premium user: ',
      premium
    );
    if( !readyToShow ) return { 'readyToShow': false }; // NOTE very important to make this return

    const hidden: integer | null =
      await storage.get( 'notificationHidden' ) || null;
    const days = 7;

    const now: integer = Date.now();

    // Is popup big?
    const visible = ( () => {
      // Old variant or no data
      if( !hidden ) return true;

      const breakPoint = hidden + 1000 * 60 * 60 * 24 * days;
      return now > breakPoint;
    })();

    const { promotions } = storeState;

    const promotion = promotions.find( ({ from, till, notifications }) => (
      notifications
      && notifications.length
      && notifications.filter( ({ domains }) => (
        !domains
        || domains.includes( domain )
        || domains.some( item => domain.endsWith( '.' + item ) )
      ) ).length
      && from <= now
      && now <= till
    ) );

    const expvarid = await experimentsHelper.getEngagedEnabledExpvarid();

    const html: TreeElement[] = await ( async() => {
      const clientId: string = await ga.full.userIdPromise;
      // Dynamic banner
      if( promotion ) {
        const { notifications } = promotion;

        const notification = notifications.find( ({ domains }) => (
          !domains
          || domains.includes( domain )
          || domains.some( item => domain.endsWith( '.' + item ) )
        ) );
        if( !notification ) {
          throw new Error( 'No notification object' ); // Flow crap
        }
        const { html, texts } = notification;

        // Change link
        changeLinkDeepLoop( html, ( originalUrl ) => {
          let url = new URL( originalUrl );

          url.searchParams.set( 'utm_content', secondLevelDomain );
          if( expvarid ) {
            url.searchParams.set( 'expvarid', expvarid );
          }
          url.searchParams.set( 'cid', String( clientId ) );

          return url.toString();
        });

        const selectedLanguage =
          Object.keys( texts ).includes( language )
            ? language
            : 'en';

        return translationReplaceCrawler( html, texts[ selectedLanguage ] );
      }

      const isBbcBanner = domain.endsWith( '.bbc.com' ) || domain.endsWith( '.bbc.co.uk' );
      const isYoutubeBanner = domain.includes( 'youtube.' ) || domain.endsWith( 'youtu.be' );

      const translationLanguage/*: string*/ = ( () => {
        if (isBbcBanner || isYoutubeBanner ) {
          return [ 'en', 'ru' ].includes( language ) ? language : 'en';
        }
        return languages.includes( language ) ? language : 'en';
      })();
      const threeWaysAlgorithm/*: boolean*/ =
        language === 'en' || !languages.includes( language );

      const now/*: integer*/ = Date.now();
      const activePromotionWithTariff = storeState.promotions.find(
        ({ from, till, tariffs, is_discount }) => is_discount && from <= now && now <= till && tariffs?.length
      );

      const campaign = activePromotionWithTariff?.id ?? 'default_campaign';

      const plan/*: string*/ = ( () => {
        switch( duration ) {
          case 1: return 'monthly';
          case 12: return 'annual';
          case 24: return 'biennial';
          default: throw new Error( 'Incorrect duration' );
        }
      })();

      const linkParams: { [ key: string ]: string } = {
        'plan_id': plan,
        'utm_campaign': campaign,
        'utm_content': secondLevelDomain,
        'utm_medium': 'inpage_notification',
        'utm_source': 'chromium extension',
        'utm_term': translationLanguage
      };

      if( expvarid ) {
        linkParams.expvarid = expvarid;
      }

      const staticPromotionOriginalUrl = activePromotionWithTariff?.clickUrl || pageLinks.premium;
      const staticPromotionUrl = new URL( staticPromotionOriginalUrl );
      staticPromotionUrl.searchParams.set( 'cid', String( clientId ) );

      const link = browsecLink(
        staticPromotionUrl.toString(),
        search => Object.assign( search, linkParams ),
      );

      const usedTranslation: {
        'title': string,
        'price_description': string,
        'upgrade_to_premium_now': string,
        'remind_me_later': string
      } = ( () => {
        let property: string;

        if (isBbcBanner) {
          property = 'bbc';
        } else if (isYoutubeBanner) {
          property = 'youtube';
        } else {
          property = 'general';
        }

        const selectedTranslation = translation
          .find( ({ language }) => language === translationLanguage );
        if( !selectedTranslation ) {
          throw new Error(
            'Incompatible language in notification/messageSystem'
          );
        }

        return selectedTranslation[ property ];
      })();

      if( !isBbcBanner ) {
        usedTranslation.price_description =
          usedTranslation.price_description.replace( /XXX/g, String( priceString ) );
      }

      const buttonText: string = ( () => {
        if( threeWaysAlgorithm ) {
          if( trialDays ) {
            return internationalize( 'get_N_days_free_premium_trial' )
              .replace( /XXX/g, String( trialDays ) );
          }
          if( discount ) {
            return internationalize( 'get_monthly_premium' );
          }
        }

        return usedTranslation.upgrade_to_premium_now;
      })();

      const bigButtonChildren: TreeElement[] = [
        {
          'tag': 'span',
          'class':
            '_Notification_Big_Button_Name' +
            ( threeWaysAlgorithm && trialDays ? ' _Notification_Big_Button_Name_uppercase' : '' ),
          'text': buttonText
        }
      ];
      if( threeWaysAlgorithm && !trialDays && discount ) {
        bigButtonChildren.push({
          'tag': 'span',
          'class': '_Notification_Big_Button_Price',
          'children': [
            { 'text': 'for only ' },
            {
              'tag': 'span',
              'class': '_Notification_Big_Button_Price_Value',
              'text': currency + price
            },
            { 'text': ' ' },
            {
              'tag': 'span',
              'class': '_Notification_Big_Button_Price_OldValue',
              'text': currency + oldPrice
            }
          ]
        });
        bigButtonChildren.push({
          'tag': 'span',
          'class': '_Notification_Big_Button_Discount',
          'children': [
            {
              'tag': 'span',
              'class': '_Notification_Big_Button_Discount_In',
              'children': [
                {
                  'tag': 'span',
                  'class': '_Notification_Big_Button_Discount_In_In',
                  'children': [
                    {
                      'tag': 'span',
                      'class': '_Notification_Big_Button_Discount_Minus',
                      'text': '-'
                    },
                    {
                      'tag': 'span',
                      'class': '_Notification_Big_Button_Discount_Value',
                      'text': String( discount )
                    },
                    {
                      'tag': 'span',
                      'class': '_Notification_Big_Button_Discount_Percent',
                      'text': '%'
                    }
                  ]
                }
              ]
            }
          ]
        });
      }

      return {
        'tag': 'div',
        'class': '_Notification_Big_In',
        'children': [
          {
            'tag': 'div',
            'class': '_Notification_Big_In_In',
            'children': [
              {
                'tag': 'div',
                'class': '_Notification_Big_Title',
                'text': usedTranslation.title
              },
              {
                'tag': 'div',
                'class': '_Notification_Big_Text',
                'text': usedTranslation.price_description
              },
              {
                'tag': 'a',
                'class':
                  '_Notification_Big_Button' +
                  ( threeWaysAlgorithm && !trialDays && discount ? ' _Notification_Big_Button_long' : '' ),
                'attributes': {
                  'href': link,
                  'target': '_blank'
                },
                'children': [
                  {
                    'tag': 'span',
                    'class': '_Notification_Big_Button_In',
                    'children': bigButtonChildren
                  }
                ]
              },
              {
                'tag': 'div',
                'class': '_Notification_Later',
                'children': [
                  {
                    'attributes': {
                      'data-click': 'close'
                    },
                    'tag': 'div',
                    'class': '_Notification_Later_In',
                    'text': usedTranslation.remind_me_later
                  }
                ]
              }
            ]
          }
        ]
      };
    })();

    return {
      html,
      proxyEnabled,
      promotionId: promotion?.id,
      readyToShow: true,
      size: visible ? 'big' : 'small'
    };
  }
});


/** Set visibility state */
onMessage.addListener({
  type: NOTIFICATIONS.requestSetVisibility,
  callback: async(
    { 'visible': popupVisible, url }: { 'visible': boolean, 'url': string }
  ) => {
    if( popupVisible ) {
      storage.remove( 'notificationHidden' );
      return;
    }

    storage.set( 'notificationHidden', Date.now() );
  }
});


/** Popup literally shown up */
onMessage.addListener({
  type: NOTIFICATIONS.requestPopupShow,
  callback: (
    { promotionId, url }: { 'promotionId'?: string, 'url': string }
  ) => {
    const domain: string = urlToDomain( url ) || '';
    const label: string = domain.split( '.' ).slice( -2 ).join( '.' );
    if( !label ) return;

    ga.partial({
      'category': 'inpageNotification',
      'action': 'show',
      label
    });

    jitsu.track( 'inpage_notification', {
      'campaign': promotionId || 'default',
      'inpage_notification_domain': domain
    });
  }
});


/** Click on link */
onMessage.addListener({
  type: NOTIFICATIONS.requestClick,
  callback: (
    { promotionId, url }: { 'promotionId'?: string, 'url': string }
  ) => {
    const domain: string = urlToDomain( url ) || '';
    const label: string = domain.split( '.' ).slice( -2 ).join( '.' );
    if( !label ) return;

    ga.partial({
      'category': 'inpageNotification',
      'action': 'click',
      label
    });

    jitsu.track( 'inpage_notification_click', {
      'campaign': promotionId || 'default',
      'inpage_notification_domain': domain
    });
  }
});


/** Ping for content script */
onMessage.addListener({
  type: NOTIFICATIONS.ping,
  callback: () => 'ok'
});

store.onChange(
  ({ userPac }) => ({
    isProxy: userPac.mode === PAC_MODE.proxy,
  }),
  ({ isProxy }) => {
    if (isProxy) {
      sendMessageToContent(
        { type: NOTIFICATIONS.proxyTurnedOn },
        { filter: ({ url }) => checkUrlInList(url) },
      );
    }
  },
);
