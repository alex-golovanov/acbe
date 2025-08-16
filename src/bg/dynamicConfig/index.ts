/* global DynamicConfig */
import store from 'store';
import isObject from 'tools/isObject';
import alarms from 'alarms';
import log from 'log';

import dynamicConfig from '../../dualUse/ajaxes/dynamicConfig';

const intervalInMinutes = 4 * 60;

export async function updateDynamicConfig(): Promise<DynamicConfig | null> {
  const config = await dynamicConfig();

  if( !isObject( config ) ) {
    return null;
  }

  store.dispatch({
    'type': 'Dynamic config: update',
    'data': { 'dynamicConfig': config }
  });

  return config;
}

export const ALARM_ID = 'update-dynamic-config';

export function runAndScheduleDynamicConfigUpdate() {
  updateDynamicConfig();

  log( `${ALARM_ID} alarm scheduled` );

  alarms.createCycle(ALARM_ID, {
    'delay': intervalInMinutes,
    'periodInMinutes': intervalInMinutes,
  });
};

alarms.on(async({ name }) => {
  if ( name === ALARM_ID ) {
    log( `${ALARM_ID} alarm fired` );
    await updateDynamicConfig();
  }
});
