/* global HostPing */
import checkServerTestUrl from 'tools/checkServerTestUrl';
import Deferred from 'tools/Deferred';

type DeferredItem = {
  end: Deferred<undefined>;
  host: string;
  start: Deferred<undefined>;
  started: boolean;
};

const CONNECTIONS_LIMIT = 6;
const CONNECTION_TIMEOUT = 10 * 1000;

/** Get pure not any-how changed pings on every host
@function */
export default async (hosts: string[]): Promise<HostPing[]> => {
  const pings: HostPing[] = [];

  const deferreds: DeferredItem[] = hosts.map( host => {
    const url/*: string*/ =
      `http://${host}/api/test?` + Math.floor( Math.random() * 1000000000000 );

    const start: Deferred<undefined> = new Deferred();
    const end: Deferred<undefined> = new Deferred();

    const deferredItem: DeferredItem = { end, host, start, started: false };

    start.then(() => {
      deferredItem.started = true;

      (async () => {
        try {
          const controlObject = checkServerTestUrl(url, CONNECTION_TIMEOUT);
          const delay = await controlObject.promise;

          pings.push({ host, delay, valid: true });
        } catch (error) {
          pings.push({ host, valid: false });
        } finally {
          end.resolve();
        }
      })();
    });

    end.then(() => {
      const next = deferreds.find(({ started }) => !started);
      if (next) next.start.resolve();
    });

    return deferredItem;
  });

  // Initial start
  deferreds.slice(0, CONNECTIONS_LIMIT).forEach(({ start }) => {
    start.resolve();
  });

  await Promise.all(deferreds.map(({ end }) => end));

  return pings;
};
