import { describe, beforeEach, beforeAll, test, expect } from '@jest/globals';
import store from 'store';
import ga from 'ga';
import { browsecLink } from 'general/tools';

describe('BrowsecLink expvarid tests', () => {
  beforeAll(() => {
    store.clear();
  });

  test('should return a link with utm_source and utm_campaign and empty (0) experiments', async () => {
    const expectedResult =
      'https://browsec.com/en/orders/new?plan_id=annual&ref=extension&cid=mock_GA_userId_wefewfewfewfewf&utm_source=chromium%20extension&utm_campaign=default_campaign&instd=undefined';
    const pageLinks = {
      base: 'https://browsec.com',
    };
    const storeState = await store.getStateAsync();

    const urlParams = {
      utm_source: 'chromium extension',
      utm_campaign: 'default_campaign',
    };

    const clientId = await ga.full.userIdPromise;

    const expirationPremiumLink = browsecLink({
      action: (search) => {
        return Object.assign(search, urlParams);
      },
      storeState,
      url:
        pageLinks.base +
        '/en/orders/new?plan_id=annual&ref=extension&cid=' +
        clientId,
    });
    console.log(expirationPremiumLink);
    expect(expirationPremiumLink).toBe(expectedResult);
  });
});
