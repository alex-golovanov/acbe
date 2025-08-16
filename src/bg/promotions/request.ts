/* global Credentials, Promotion, RawTariff */
import ajax from 'tools/ajax';
import apiRequest from 'tools/apiRequest';
import availableServer from 'availableServer';
import config from 'config';
import log from 'log';
import { convertRawTariffs } from './convertRawTariffs';
import { validateRawTariffs } from './validateRawTariffs';


type AjaxPromoItemMedia = {
  'banner': {
    'click_url'?: string,
    'json_url'?: string,
    'json'?: string
  },
  'inpage_notifications'?: Array<{
    'domains'?: string[],
    'json_url'?: string,
    'json'?: {
      'html': any,
      'texts': { [ key: string ]: { [ key: string ]: string } }
    }
  }>,
  'promo_page'?: {
    'active_tab'? :boolean,
    'scope'?: 'all' | 'new',
    'url': string
  }
};

type AjaxPromoItemWithMedia = {
  'click_url'?: string,
  'from': string,
  'kind'?: 'common' | 'personal',
  'media': AjaxPromoItemMedia,
  'tariffs'?: RawTariff[],
  'till': string,
  'uid': string,
  'is_discount': boolean
};

type AjaxPromoItemNoMedia = {
  'click_url'?: string,
  'from': string,
  'kind'?: 'common' | 'personal',
  'media': undefined,
  'tariffs'?: RawTariff[],
  'till': string,
  'uid': string,
  'is_discount': boolean
};

type AjaxPromoItem = AjaxPromoItemWithMedia | AjaxPromoItemNoMedia;


/** @function */
export default async(
  { clientId, credentials }: { 'clientId': string, 'credentials'?: Credentials }
): Promise<Promotion[]> => {
  let baseUrl: string = await availableServer.getServer();

  let ajaxReturn;
  try {
    ajaxReturn = await apiRequest(
      baseUrl + '/promo/extension?_=' + Math.floor( Math.random() * 1000000000 ),
      {
        'dataType': 'json',
        'cache': 'no-store',
        'headers': { 'Content-Type': 'application/x-www-form-urlencoded' },
        'method': 'GET',
        'tokenCredentials': credentials
      }
    );
  }
  catch ( error ) {
    availableServer.restart();
    throw error;
  }

  let {
    'error_message': error,
    'promo': list,
    ok
  }: {
    'error_message': string | undefined,
    'promo': AjaxPromoItem[],
    'ok': boolean
  } = ajaxReturn;


  if( !ok ) throw new Error( error );

  let promises: Array<Promise<Promotion>> = list
    .filter( ( item ): item is AjaxPromoItemWithMedia => Boolean(
      item.media && typeof item.media === 'object'
    ) )
    .map( ( item ) => {
      const {
        banner,
        'inpage_notifications': notifications,
        'promo_page': promoPage
      } = item.media;

      const bannerAvailable = Boolean( banner?.json_url || banner?.json );
      const notificationsAvailable = Boolean( notifications );
      const promoPageAvailable = Boolean( promoPage?.url );

      return Object.assign(
        {},
        item,
        {
          banner,
          notifications,
          promoPage,

          bannerAvailable,
          notificationsAvailable,
          promoPageAvailable
        }
      );
    })
    .filter(
      ({
        bannerAvailable,
        media,
        notificationsAvailable,
        promoPageAvailable
      }) => {
        const condition =
          bannerAvailable || notificationsAvailable || promoPageAvailable;
        if( !condition ) {
          log.error(
            'Banner, page notifications and promo page not specified. Promotion media object:', media
          );
        }

        return condition;
      }
    )
    .map( async({
      'click_url': clickUrl,
      from,
      kind = 'common',
      'tariffs': rawTariffs,
      till,
      'uid': id,
      'is_discount': isDiscount,

      banner,
      notifications,
      promoPage,

      bannerAvailable,
      notificationsAvailable,
      promoPageAvailable
    }): Promise<Promotion> => {
      let bannerLink: string | undefined = bannerAvailable
        ? banner.click_url || config.baseUrl + '/en/orders/new?plan_id=annual&ref=extension'
        : undefined;

      // add client id to the banner link
      if( bannerLink ) {
        const urlObject = new URL( bannerLink );
        urlObject.searchParams.set( 'cid', String( clientId ) );
        bannerLink = urlObject.toString();
      }

      const structurePromise = ( async() => {
        if( !bannerAvailable ) return;

        const ajaxUrl: string | undefined = banner.json_url;

        if( ajaxUrl ) {
          return ajax( ajaxUrl, { 'dataType': 'json', 'method': 'GET' });
        }
        if( banner.json ) {
          return JSON.parse( banner.json );
        }
      })();

      const notificationsPromise = !notifications
        ? Promise.resolve( [] )
        : Promise.all( notifications.map(
          async({ domains, 'json_url': jsonUrl, json }) => {
            if( jsonUrl && !json ) {
              json = await ajax( jsonUrl, { 'dataType': 'json', 'method': 'GET' });
            }
            if( !json ) { // Flow crap
              throw new Error( 'No json or jsonUrl property specified' );
            }

            const { html, texts }/*: { 'html': Object, 'texts': { [ string ]: { [ string ]: string } } }*/ =
              json;

            return { domains, html, texts };
          }
        ) );

      // Url of page, opened only one time
      const page: string | undefined = promoPageAvailable
        ? promoPage?.url
        : undefined;

      const pageActive: boolean = promoPageAvailable
        ? Boolean( promoPage?.active_tab )
        : false;

      const pageScope: 'all' | 'new' = promoPage?.scope || 'all';

      {
        // Make it parallel
        const [ notifications, structure ] = await Promise.all( [
          ( async() => {
            try {
              return await notificationsPromise;
            }
            catch ( error ) {
              return [];
            }
          })(),
          ( async() => {
            try {
              return await structurePromise;
            }
            catch ( error ) {}
          })()
        ] );

        const output: any = {
          clickUrl,
          id,
          'from': Date.parse( from ),
          kind,
          notifications,
          'till': Date.parse( till ),
          isDiscount
        };

        try {
          if( bannerAvailable && structure ) {
            output.banner = { 'link': bannerLink, structure };
          }
          if( promoPageAvailable ) {
            output.page = page;
            output.pageActive = pageActive;
            output.pageScope = pageScope;
          }

          rawTariffs = validateRawTariffs( rawTariffs );
          if( rawTariffs.length ) {
            const { tariffs, trialDays } = convertRawTariffs( rawTariffs );

            output.tariffs = tariffs;
            if( trialDays ) output.trialDays = trialDays;
          }

          return output;
        }
        catch ( error ) {
          log.error( 'Incorrect data format in promotions' );
          throw error;
        }
      }
    });

  return Promise.all( promises );
};
