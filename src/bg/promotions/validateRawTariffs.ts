/* global RawTariff */
export const validateRawTariffs = (
  rawTarrifs: RawTariff[] | void,
): RawTariff[] => {
  if (!rawTarrifs || !Array.isArray(rawTarrifs)) return [];

  return rawTarrifs.filter(
    ({ kind, prices: rawPrices, duration: rawDuration }) =>
      Object.entries(rawPrices).every(
        ([currency, rawPrice]) =>
          typeof rawPrice?.amount === 'number' &&
          typeof rawDuration?.months === 'number',
      ),
  );
};
