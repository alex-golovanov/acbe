import { describe, test, expect } from '@jest/globals';
import { convertRawTariffs } from './convertRawTariffs';

describe('convertRawTariffs', () => {
  test('Old price lower than current', () => {
    expect(
      convertRawTariffs([
        {
          kind: 'monthly',
          trial_days: 7,
          prices: {
            USD: {
              amount: 4.99,
              base_amount: 4,
            },
          },
          duration: {
            unit: 'days',
            qty: 2,
            months: 1,
          },
        },
      ]),
    ).toEqual({
      tariffs: [
        {
          kind: 'monthly',
          prices: [
            {
              currency: 'USD',
              value: 4.99,
            },
          ],
          duration: 1,
        },
      ],
      trialDays: 7,
    });
  });

  test('Empty array', () => {
    expect(convertRawTariffs([])).toEqual({
      tariffs: [],
      trialDays: 0,
    });
  });

  test('Multiple tariffs', () => {
    expect(
      convertRawTariffs([
        {
          kind: 'monthly',
          trial_days: 7,
          prices: {
            USD: {
              amount: 4.99,
              base_amount: 4,
            },
          },
          duration: {
            unit: 'days',
            qty: 2,
            months: 1,
          },
        },
        {
          kind: 'yearly',
          trial_days: 14,
          prices: {
            EUR: {
              amount: 49.99,
            },
          },
          duration: {
            unit: 'days',
            qty: 365,
            months: 12,
          },
        },
      ]),
    ).toEqual({
      tariffs: [
        {
          kind: 'monthly',
          prices: [
            {
              currency: 'USD',
              value: 4.99,
            },
          ],
          duration: 1,
        },
        {
          kind: 'yearly',
          prices: [
            {
              currency: 'EUR',
              value: 49.99,
            },
          ],
          duration: 12,
        },
      ],
      trialDays: 14,
    });
  });

  test('Tariff without base_amount', () => {
    expect(
      convertRawTariffs([
        {
          kind: 'monthly',
          trial_days: 7,
          prices: {
            USD: {
              amount: 4.99,
            },
          },
          duration: {
            unit: 'days',
            qty: 2,
            months: 1,
          },
        },
      ]),
    ).toEqual({
      tariffs: [
        {
          kind: 'monthly',
          prices: [
            {
              currency: 'USD',
              value: 4.99,
            },
          ],
          duration: 1,
        },
      ],
      trialDays: 7,
    });
  });
});
