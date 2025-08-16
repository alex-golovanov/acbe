import ga from 'ga';
import jitsu from 'jitsu';
import storage from 'storage';

// Every 10 MB
const STEP_SIZE = Math.pow(1024, 2) * 10;

/**
 * Class representing a traffic counter.
 *
 * This class is responsible for tracking the amount of traffic in bytes
 * (doesnt count [Transfer-Encoding: chunked] - traffic),
 *
 * @method add - Adds the specified size to the traffic counter.
 * @method get - Gets the current size of traffic.
 * @method addListener - Adds a listener that is called when the traffic size changes.
 * @method removeListener - Removes a previously added listener.
 */
class TrafficCounter {
  delayedSize: number;
  initiated: boolean;
  listeners: Array<(recent: number, old: number) => any>;
  size: number;
  sizePromise: Promise<number>;
  lastReportedSize: number;

  constructor() {
    this.delayedSize = 0;
    this.size = 0;
    this.initiated = false;
    this.listeners = [];
    this.lastReportedSize = 0;

    this.sizePromise = (async () => {
      const size: number = (await storage.get('trafficCounter')) || 0;

      this.size = this!.delayedSize + size;
      this.lastReportedSize = this.size;
      this.initiated = true;

      return this.size;
    })();

    /** @function */
    const loop = () => {
      storage.set('trafficCounter', this.size);

      setTimeout(loop, 30 * 1000);
    };
    setTimeout(loop, 30 * 1000);
  }

  /** @method */
  add(size: number) {
    if (!size) return;

    const old = this.initiated ? this.size : this.delayedSize;
    const recent = old + size;

    if (this.initiated) this.size = recent;
    else this.delayedSize = recent;

    // Send analitics every STEP_SIZE (10) MB
    if (recent - this.lastReportedSize >= STEP_SIZE) {
      const mbValue = Math.floor(recent / Math.pow(1024, 2)) + 'mb';

      ga.full({ category: 'traffic', action: mbValue });
      jitsu.track('traffic_in', { value: mbValue });

      this.lastReportedSize = recent;
    }

    if (this.initiated) {
      this.listeners.forEach((listener) => {
        listener(recent, old);
      });
    }
  }

  /** @method */
  async get() {
    return this.initiated ? this.size : this.sizePromise;
  }

  /** @method */
  addListener(listener: (recent: number, old: number) => any) {
    this.listeners.push(listener);
  }

  /** @method */
  removeListener(listener: (recent: number, old: number) => any) {
    this.listeners = this.listeners.filter((item) => item !== listener);
  }
}

export const trafficCounter = new TrafficCounter();
