import storage from 'storage';
import log from 'log';

// https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers#keep_a_service_worker_alive_continuously

export default class KeepAliveWorker {
  readonly heartbeatStorageKey = 'last-heartbeat';
  private heartbeatInterval: ReturnType<typeof setInterval> | undefined;

  start(): ReturnType<typeof setInterval> {
    this.heartbeatInterval = setInterval( this.runHeartbeat, 1000 * 60 * 5 );
    log( 'KeepAliveWorker Started' );
    return this.heartbeatInterval;
  }

  stop(): Boolean {
    if( this.heartbeatInterval ) {
      clearInterval( this.heartbeatInterval );
    }

    return true;
  }

  private async runHeartbeat(): Promise<void> {
    const timestamp = Date.now();
    await storage.set( this.heartbeatStorageKey, timestamp );
    log( 'KeepAliveWorker::Heartbeat', new Date( timestamp ) );
  }
}
