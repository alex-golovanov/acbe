/* global CountryPrefixPort, PacHost */
/**
 * Maps an array of PacHost objects to an array of CountryPrefixPort objects.
 *
 * @param {PacHost[]} servers - An array of PacHost objects.
 * @return {CountryPrefixPort[]} An array of CountryPrefixPort objects.
 */
export const pacHostsToCountryPrefixPorts = (
  servers: PacHost[],
): CountryPrefixPort[] =>
  servers.map(({ host, port, ...server }) => {
    const countryWithNumber = host.split('.')[0];

    return {
      prefix: countryWithNumber,
      port,
      host,
      ...server,
    };
  });
