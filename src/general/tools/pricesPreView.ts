/* global Price */
/** @function */
export default (
  { language, prices, priceTrial }: {
    'language': 'en' | 'ru',
    'prices': Price[],
    'priceTrial': integer | undefined
  }
): {
  'currency': string,
  'duration': integer,
  'oldPrice': number,
  'oldPriceString': string,
  'price': number,
  'priceString': string,
  'trialDays': integer
} => {
  if( language === 'ru' ) {
    const localPrices = prices.filter( ({ currency }) => currency === 'RUB' );

    if( localPrices.length ) prices = localPrices;
  }
  else {
    prices = prices.filter( ({ currency }) => currency === 'USD' );
  }

  const cheapObject = prices
    .slice()
    .sort( ( a, b ) => a.value / a.duration - b.value / b.duration )[ 0 ];
  const expensiveObject = prices
    .slice()
    .sort( ( a, b ) => b.value / b.duration - a.value / a.duration )[ 0 ];

  let { currency, oldValue } = expensiveObject;

  let price = ( () => {
    if( currency === 'RUB' ) return Math.floor( cheapObject.value / cheapObject.duration );
    return Math.floor( 100 * cheapObject.value / cheapObject.duration ) / 100;
  })();
  let oldPrice = ( () => {
    if( !oldValue ) return 0;

    return currency !== 'RUB'
      ? Math.floor( 100 * oldValue / expensiveObject.duration ) / 100
      : Math.floor( oldValue / expensiveObject.duration );
  })();
  
  
  const trialDays = priceTrial || 0;

  const priceString = currency === 'USD'
    ? '$' + price
    : price + '₽';
  const oldPriceString = currency === 'USD'
    ? '$' + oldPrice
    : oldPrice + '₽';

  return {
    currency,
    'duration': cheapObject.duration,
    oldPrice,
    oldPriceString,
    price,
    priceString,
    trialDays
  };
};
