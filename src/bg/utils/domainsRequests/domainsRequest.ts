/* global DiagnosticsRequestState, OnErrorOccurredDetails */
import { uniq } from 'lodash';
import ajax from 'tools/ajax';
import Browser from 'crossbrowser-webextension';

/**
 * Makes checking requests to a list of domains and returns the result.
 *
 * @param {string[]} domains - An array of domains to make requests to.
 * @return {Promise<DiagnosticsRequestState>} - A promise that resolves to an object containing the errors, requests, and state of the requests.
 */
export const domainsRequest = async (
  domains: string[],
): Promise<DiagnosticsRequestState> => {
  // Add extra randomized string to domain urls to ignore cache
  let urls: string[] = domains.map(
    (domain) => domain + '?_=' + Math.floor(Math.random() * 1000000000),
  );

  let errors: string[] = [];

  let listener = ({ error, url }: OnErrorOccurredDetails) => {
    if (!urls.includes(url)) return;

    errors.push('Browser internal: ' + error);
  };

  Browser.webRequest.onErrorOccurred.addListener(listener, {
    urls: ['<all_urls>'],
  });

  let states: boolean[] = await Promise.all(
    urls.map(
      (domain) =>
        new Promise((resolve: (value: boolean) => void) => {
          let resolved /*: boolean*/ = false;

          const controller =
            typeof AbortController === 'function'
              ? new AbortController()
              : undefined;

          (async () => {
            try {
              let options: any = { method: 'GET' };
              if (controller) options.signal = controller.signal;

              await ajax(domain, options);
              resolved = true;
              resolve(true);
            } catch (error) {
              let { message, status } = error;
              errors.push(
                `Browser external error |${
                  status || 'no status'
                }| for domain ${domain}: ` + message,
              );
              resolved = true;
              resolve(false);
            }
          })();

          setTimeout(() => {
            if (resolved) return;

            controller?.abort?.();
            errors.push('Browsec: timeout reached');
            resolve(false);
          }, 30 * 1000);
        }),
    ),
  );

  Browser.webRequest.onErrorOccurred.removeListener(listener);

  let requests: { total: integer; success: integer } = {
    total: states.length,
    success: states.filter((value) => value).length,
  };

  let state: 'error' | 'success' | 'warning' = (() => {
    if (!requests.success) return 'error';
    if (requests.success === requests.total) return 'success';
    return 'warning';
  })();

  // Remove dublicate errors
  errors = uniq(errors);

  return { errors, requests, state };
};
