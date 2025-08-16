/* global HostPing, PacHost */
import adaptFiltersForPac from "./adaptFiltersForPac";
import getIgnoredDomains from "./getIgnoredDomains";
import { getServersArray } from "./getServersArray";
import storage from "storage";
import store from "store";

/** @function */
const rotateServerInCountry = async (country: string, failedHost: string) => {
  const storeState = await store.getStateAsync();
  const { lowLevelPac } = storeState;

  // Get current server lists
  const premiumServers = lowLevelPac.premiumCountries[country];
  const regularServers = lowLevelPac.countries[country];

  // Check if we have any servers to rotate
  const hasPremiumServers = premiumServers && premiumServers.length > 1;
  const hasRegularServers = regularServers && regularServers.length > 1;

  if (!hasPremiumServers && !hasRegularServers) {
    // No servers to rotate in either list
    return false;
  }

  // Check if the failed server is the first server and needs rotation
  const needsPremiumRotation =
    hasPremiumServers && premiumServers[0].includes(failedHost);
  const needsRegularRotation =
    hasRegularServers && regularServers[0].includes(failedHost);

  if (!needsPremiumRotation && !needsRegularRotation) {
    // Failed server is not the first server, no rotation needed
    return false;
  }

  // Helper function to rotate server list
  const rotateServerList = (serverList: string[]) => {
    const firstServer = serverList.shift()!; // Remove first server
    serverList.push(firstServer); // Add it to the end
    return serverList;
  };

  // Perform the actual rotation
  const newPremiumCountries = { ...lowLevelPac.premiumCountries };
  const newCountries = { ...lowLevelPac.countries };
  let rotationPerformed = false;

  // Premium servers take priority - rotate both if they contain the same servers
  if (needsPremiumRotation) {
    const rotatedPremiumServers = rotateServerList(premiumServers);
    newPremiumCountries[country] = rotatedPremiumServers;
    rotationPerformed = true;

    // If regular servers are the same as premium (for premium users), rotate them too
    if (
      needsRegularRotation &&
      JSON.stringify(premiumServers) === JSON.stringify(regularServers)
    ) {
      newCountries[country] = [...rotatedPremiumServers];
    }
  } else if (needsRegularRotation) {
    newCountries[country] = rotateServerList(regularServers);
    rotationPerformed = true;
  }

  if (rotationPerformed) {
    store.dispatch({
      type: "Low level PAC: update",
      data: {
        countries: newCountries,
        premiumCountries: newPremiumCountries,
      },
    });

    return true;
  }

  return false;
};

/** @function */
const shuffle = async () => {
  const storeState = await store.getStateAsync();

  const { proxyServers, user, userPac } = storeState;

  const globalReturn = userPac.mode === "proxy" ? userPac.country : null;

  const availableServerUrls = await storage.get("availableServerList");
  const rawPings: HostPing[] = (await storage.get("pingsRaw")) || [];

  const premiumCountries: { [country: string]: string[] } = {};
  const countries: { [country: string]: string[] } = {};
  const hosts: Set<string> = new Set();

  for (const [country, value] of proxyServers) {
    if (value.premium) {
      premiumCountries[country] = getServersArray(value.premium, rawPings);
    }

    const countryPrefixPorts = user.premium ? value.premium : value.free;

    if (countryPrefixPorts) {
      countries[country] = getServersArray(countryPrefixPorts, rawPings);
    }

    for (const sType of ["free", "premium"]) {
      if (value[sType]) {
        for (const { host } of value[sType]) {
          hosts.add(host);
        }
      }
    }
  }

  const ignoredDomains = getIgnoredDomains({
    availableServerUrls,
    hosts: Array.from(hosts),
  });

  const siteFilters = adaptFiltersForPac({
    countries: Object.keys(countries),
    defaultCountry: "fi",
    filters: userPac.filters,
  });

  store.dispatch({
    type: "Low level PAC: update",
    data: {
      countries,
      globalReturn,
      ignoredDomains,
      premiumCountries,
      siteFilters,
    },
  });
};

export default { shuffle, rotateServerInCountry };
