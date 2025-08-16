import { describe, test, expect } from '@jest/globals';
import { pacHostsToCountryPrefixPorts } from './pacHostsToCountryPrefixPorts';

describe('pacHostsToCountryPrefixPorts', () => {
  test('should map an array of PacHost objects to CountryPrefixPort objects correctly', () => {
    const servers = [
      { host: 'us1.example.com', port: 443, someProperty: 'value1' },
      { host: 'de2.example.com', port: 8443, someProperty: 'value2' },
      { host: 'fr3.example.com', port: 8080, someProperty: 'value3' },
    ];

    const expected = [
      { prefix: 'us1', port: 443, someProperty: 'value1', host: 'us1.example.com' },
      { prefix: 'de2', port: 8443, someProperty: 'value2', host: 'de2.example.com' },
      { prefix: 'fr3', port: 8080, someProperty: 'value3', host: 'fr3.example.com' },
    ];

    const result = pacHostsToCountryPrefixPorts(servers);

    expect(result).toEqual(expected);
  });

  test('should handle an empty array', () => {
    const servers = [];

    const result = pacHostsToCountryPrefixPorts(servers);

    expect(result).toEqual([]);
  });

  test('should handle hosts without a subdomain prefix', () => {
    const servers = [
      { host: 'localhost', port: 3000, someProperty: 'value1' },
    ];

    const expected = [
      { prefix: 'localhost', port: 3000, someProperty: 'value1', host: 'localhost' },
    ];

    const result = pacHostsToCountryPrefixPorts(servers);

    expect(result).toEqual(expected);
  });

  test('should map an array with different properties correctly', () => {
    const servers = [
      { host: 'jp1.example.com', port: 9000, anotherProperty: 'test' },
      { host: 'uk2.example.com', port: 22, moreProperties: 'data' },
    ];

    const expected = [
      { prefix: 'jp1', port: 9000, anotherProperty: 'test', host: 'jp1.example.com' },
      { prefix: 'uk2', port: 22, moreProperties: 'data', host: 'uk2.example.com' },
    ];

    const result = pacHostsToCountryPrefixPorts(servers);

    expect(result).toEqual(expected);
  });
});
