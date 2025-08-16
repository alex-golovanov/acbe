/* global HostPing, PingCountryAverage, PingRating, PingSortedServer */
import countryDelaysToCountryRatings from './countryDelaysToCountryRatings';
import delaysToCountryDelays from './delaysToCountryDelays';
import getSortedServers from './getSortedServers';
import hostsToPings from './hostsToPings';
import storage from 'storage';
import store from 'store';

const { _ } = self;


/** @function */
export default async() => {
  const { proxyServers } = await store.getStateAsync();

  const servers: PingSortedServer[] =
    getSortedServers({ proxyServers })
      .map( serverData => {
        let hosts: string[] = serverData.hosts;

        // Remove half of hosts to decrease requests count
        hosts = _.shuffle( hosts ).slice( 0, Math.ceil( hosts.length / 2 ) );

        return Object.assign({}, serverData, { hosts });
      });

  const hosts: string[] = servers.flatMap( ({ hosts }) => hosts );

  store.dispatch({ 'type': 'PingInProcess: set', 'data': true });

  const pings: HostPing[] = await hostsToPings( hosts );

  store.dispatch({ 'type': 'PingInProcess: set', 'data': false });

  // Save raw pings for PAC server sorting purpose
  storage.remove( 'rawPings' );
  storage.set( 'pingsRaw', pings );

  // Merge data about hosts in countries list
  const countryDelayData: PingCountryAverage[] =
    delaysToCountryDelays({ servers, pings });

  const countryRatings: PingRating[] =
    countryDelaysToCountryRatings({ 'delayData': countryDelayData, servers });

  store.dispatch({ 'type': 'Ping: set', 'data': countryRatings });
};
