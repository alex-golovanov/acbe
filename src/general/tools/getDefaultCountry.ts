import store from 'store';
import log from 'log';

export async function getDefaultCountry() {
  const storeState = await store.getStateAsync();

  const { user, dynamicConfig } = storeState;
  const premium = user?.premium;

  log(`[defaultCountry] prem:${premium}; dc.defaultCountry:${JSON.stringify(dynamicConfig?.defaultCountry)}`);

  if (dynamicConfig?.defaultCountry) {
    const dCountry = dynamicConfig.defaultCountry[premium ? 'premium' : 'free'];

    if (dCountry) {
      return dCountry;
    }
  }

  return premium ? 'nl' : 'fr';
}
