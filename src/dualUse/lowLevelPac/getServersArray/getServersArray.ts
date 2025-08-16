/* global HostPing, PacHost */
import { weightedShuffle } from 'tools/index';
import _ from 'lodash';

/**
 * Returns an array of server strings, sorted by their status.
 *
 * @param {PacHost[]} servers - An array of PacHost objects.
 * @param {HostPing[]} pings - An array of HostPing objects.
 * @return {string[]} An array of server strings in the format 'HTTPS host:port'.
 */
export const getServersArray = (
  servers: PacHost[],
  pings: HostPing[],
): string[] => {
  const groups: {
    'non-working'?: PacHost[];
    'unchecked'?: PacHost[];
    'working'?: PacHost[];
  } = _.groupBy(servers, ({ host }) => {
    if (!pings.length) return 'unchecked';

    let ping = pings.find((item) => item.host === host);
    if (!ping) return 'unchecked';

    return ping.valid ? 'working' : 'non-working';
  });

  const result: {
    'non-working': PacHost[];
    'unchecked': PacHost[];
    'working': PacHost[];
  } = {
    'non-working': _.shuffle(groups['non-working'] || []),
    'unchecked': weightedShuffle(groups.unchecked || []),
    'working': weightedShuffle(groups.working || []),
  };

  let output = ([] as PacHost[])
    .concat(result.working, result.unchecked, result['non-working'])
    .map(
      ({ port, host }) => `HTTPS ${host}:${port}`,
    );

  if (typeof browser === 'undefined') {
    // Only chrome
    output = output.slice(0, 10);
  }

  return output;
};
