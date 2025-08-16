/* global PopupBanner, Promotion, StoreState */
import storage from 'storage';


/** @function */
export default async(
  {
    forceEmpty,
    promotions,
    'showSpeedPromo': initialShowSpeedPromo,
    user
  }: (
    Pick<StoreState | 'promotions' | 'user'> & {
      'forceEmpty': boolean,
      'showSpeedPromo': boolean
    }
  )
): Promise<PopupBanner> => {
  if( forceEmpty ) return;

  const now: integer = Date.now();

  { // 1. Personal active promotion
    const activePromotion: Required<Pick<Promotion, 'banner' | 'id'>> | undefined =
      ( () => {
        const result: Promotion[] = promotions.filter(
          ({ banner, from, kind, till }) => (
            banner && from <= now && now <= till && kind === 'personal'
          ) // NOTE! with banner!
        );

        if( !result.length ) return undefined;

        const { id } = result[ 0 ];
        let banner = result[ 0 ].banner;

        return { id, banner } as Required<Pick<Promotion, 'banner' | 'id'>>;
      })();

    if( activePromotion ) {
      return {
        'banner': activePromotion.banner,
        'promotionId': activePromotion.id,
        'type': 'custom'
      };
    }
  }


  // 2. User's premium expiration
  if( user.type === 'logined' && user.premium ) {
    const paidUntil = user.loginData.subscription.paidUntil;
    const untilDate = paidUntil ? new Date( paidUntil ) : undefined;
    const userClosedWarnToPremiumEndDate =
      await storage.get( 'userClosedWarnToPremiumEndDate' );
    const condition =
      !untilDate
      || user.loginData.subscription.auto_renewal // Only payment without subscription
      || userClosedWarnToPremiumEndDate === String( untilDate )
      || Date.now() < untilDate.getTime() - 1000 * 3600 * 24 * 2; // Minus two days before expiration

    if( !condition ) {
      return { 'type': 'premium expiration' };
    }
  }

  const premiumUser: boolean = user.premium;


  // 3. Active promotion
  if( !premiumUser ) {
    const activePromotion: Required<Pick<Promotion, 'banner' | 'id'>> | undefined =
      ( () => {
        const result: Promotion[] = promotions.filter(
          ({ banner, from, kind, till }) => (
            banner && from <= now && now <= till && kind !== 'personal'
          ) // NOTE! with banner!
        );

        if( !result.length ) return undefined;

        const { id } = result[ 0 ];
        let banner = result[ 0 ].banner;

        return { id, banner } as Required<Pick<Promotion, 'banner' | 'id'>>;
      })();

    if( activePromotion ) {
      return {
        'banner': activePromotion.banner,
        'promotionId': activePromotion.id,
        'type': 'custom'
      };
    }
  }


  // 4. Upgrade speed promotion for free user
  const showSpeedPromo = ( () => {
    if( premiumUser ) return false;

    if( !initialShowSpeedPromo ) return false;
    return true;
  })();

  if( showSpeedPromo ) {
    return { 'type': 'speed' };
  }

  // 5. No banner
  return undefined;
};
