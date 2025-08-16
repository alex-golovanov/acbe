/* global Tariff, RawTariff */

/**
 * Converts an array of raw tariffs into an array of formatted tariffs and returns an object
 * containing the formatted tariffs and the maximum trial days.
 *
 * @param {RawTariff[]} rawTarrifs - The array of raw tariffs to be converted.
 * @return {{Tariffs: Tariff[], trialDays: integer}} - An object containing the formatted
 * tariffs and the maximum trial days.
 */
export const convertRawTariffs = (
  rawTarrifs: RawTariff[],
): { tariffs: Tariff[]; trialDays: integer } => {
  let validRawTariffs = rawTarrifs.filter(
    ({ kind, prices, duration: rawDuration }) =>
      Object.entries(prices).every(
        ([currency, rawPrice]) =>
          typeof rawPrice?.amount === 'number' &&
          typeof rawDuration?.months === 'number',
      ),
  );
  let tariffs: Tariff[] = validRawTariffs.map(
    ({ kind, prices: rawPrices, duration: rawDuration }) => {
      const prices = Object.entries(rawPrices).map(([currency, rawPrice]) => {
        let oldValue;
        if (rawPrice.base_amount && rawPrice.base_amount > rawPrice.amount) {
          oldValue = rawPrice.base_amount;
        }
        let price: {
          currency: string;
          value: number;
          oldValue?: number;
        } = {
          currency,
          value: rawPrice.amount,
        };
        if (oldValue) Object.assign(price, { oldValue });

        return price;
      });

      return {
        kind,
        prices,
        duration: rawDuration.months,
      };
    },
  );

  let trialDays: integer = validRawTariffs.length
    ? Math.max.apply(
      {},
      validRawTariffs.map(({ trial_days: trialDays }) => trialDays),
    )
    : 0;

  return { tariffs, trialDays };
};

