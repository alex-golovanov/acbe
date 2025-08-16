import { describe, test, expect } from '@jest/globals';
import { validateRawTariffs } from './validateRawTariffs';

describe('validateRawTariffs', () => {
  test('Tariff with incorrect price value must be filtered', () => {
    expect(
      validateRawTariffs([
        {
          kind: 'monthly',
          trial_days: 7,
          prices: {
            USD: {
              amount: 'youprst',
            },
          },
          duration: {
            unit: 'days',
            qty: 2,
            months: 1,
          },
        },
      ]),
    ).toEqual([]);
  });

  test('Tariff with incorrect duration value must be filtered', () => {
    expect(
      validateRawTariffs([
        {
          kind: 'monthly',
          trial_days: 7,
          prices: {
            USD: {
              amount: 5,
            },
          },
          duration: {
            unit: 'days',
            qty: 2,
          },
        },
      ]),
    ).toEqual([]);
  });

  test('Valid tariff should not be filtered', () => {
    expect(
      validateRawTariffs([
        {
          kind: 'monthly',
          trial_days: 7,
          prices: {
            USD: {
              amount: 5,
            },
          },
          duration: {
            unit: 'days',
            qty: 2,
            months: 1,
          },
        },
      ]),
    ).toEqual([
      {
        kind: 'monthly',
        trial_days: 7,
        prices: {
          USD: {
            amount: 5,
          },
        },
        duration: {
          unit: 'days',
          qty: 2,
          months: 1,
        },
      },
    ]);
  });

  test('Empty array should return empty array', () => {
    expect(validateRawTariffs([])).toEqual([]);
  });

  test('Undefined input should return empty array', () => {
    expect(validateRawTariffs(undefined)).toEqual([]);
  });

  test('Null input should return empty array', () => {
    expect(validateRawTariffs(null)).toEqual([]);
  });

  test('Tariff with missing duration should be filtered', () => {
    expect(
      validateRawTariffs([
        {
          kind: 'monthly',
          trial_days: 7,
          prices: {
            USD: {
              amount: 5,
            },
          },
        },
      ]),
    ).toEqual([]);
  });
});
