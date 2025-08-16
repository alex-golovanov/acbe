import { throttle } from 'lodash';
import jitsu from 'jitsu';
import store from 'store';

import { EXAMPLE_DOMAIN } from 'bg/constants/domains';
import { ADD_WARNING_ACTION } from 'general/store/actions';
import { ANTIVIRUS } from 'constants/common';
import ajax from 'tools/ajax';

export const ANTIVIRUS_WARN_TIMEOUT = 10 * 600;
export const ANTIVIRUS_ERROR_CODES = [499];

/**
 * Makes a control HTTP request to domain for getting error.
 *
 * @param {string} domain - The domain to send the request to.
 * @return {Promise<null | Error>} A Promise that resolves to null if the request is successful,
 * or rejects with an Error if there is an error.
 */
const getHttpRequestError = async (domain: string) => {
  try {
    const options: any = { method: 'GET' };
    await ajax(domain, options);
    return null;
  } catch (error) {
    return error;
  }
};

/**
 * Detects if the antivirus block is present.
 *
 * @return {Promise<boolean>} Returns a promise that resolves to a boolean indicating if the antivirus block is present.
 */
export const detectAnivirusBlock = async () => {
  const error = await getHttpRequestError(EXAMPLE_DOMAIN);

  if (!error || !ANTIVIRUS_ERROR_CODES.includes(error?.status)) {
    return false;
  }

  return error.message?.toLowerCase().includes(ANTIVIRUS);
};

/**
 * Checking and proccessing of the antivirus block.
 */
export const checkAntivirusBlock = throttle(
  async () => {
    const isAntivirus = await detectAnivirusBlock();
    const { warnings } = await store.getStateAsync();
    const isWarned = warnings.includes(ANTIVIRUS);

    if (isAntivirus) {
      jitsu.track('vpn_blocked', { source: 'antivirus' });
    }

    if (isAntivirus && !isWarned) {
      store.dispatch({
        type: ADD_WARNING_ACTION,
        data: ANTIVIRUS,
      });
    }
  },
  ANTIVIRUS_WARN_TIMEOUT,
  { trailing: false },
);

/**
 * Error listener
 *
 * @param {any} error - The error object to check.
 * @return {void}
 */
export const onGlobalRequestError = (error: any) => {
  const hasCode = [...ANTIVIRUS_ERROR_CODES, ANTIVIRUS].some((code) =>
    error.includes(code),
  );

  if (!hasCode) {
    return;
  }

  checkAntivirusBlock();
};
