import { describe, beforeEach, test, expect, jest } from '@jest/globals';
import { getServersArray } from './getServersArray';
import { weightedShuffle } from 'tools/index';
import _ from 'lodash';

jest.mock('tools/index');

// Mock implementations for lodash's shuffle and weightedShuffle
jest.spyOn(_, 'shuffle').mockImplementation((array) => array);
weightedShuffle.mockImplementation((array) => array);

describe('getServersArray', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should group servers and return a shuffled array of HTTPS URLs', () => {
    const servers = [
      { host: 'host1.com', port: 443 },
      { host: 'host2.com', port: 443 },
      { host: 'host3.com', port: 443 },
      { host: 'host4.com', port: 443 },
    ];

    const pings = [
      { host: 'host1.com', valid: true },
      { host: 'host2.com', valid: false },
      { host: 'host3.com', valid: true },
      { host: 'host4.com', valid: false },
    ];

    // Call the function under test
    const result = getServersArray(servers, pings);

    // Check that servers are grouped correctly
    expect(weightedShuffle).toHaveBeenCalledWith([
      { host: 'host1.com', port: 443 },
      { host: 'host3.com', port: 443 },
    ]);
    expect(_.shuffle).toHaveBeenCalledWith([
      { host: 'host2.com', port: 443 },
      { host: 'host4.com', port: 443 },
    ]);

    // Verify the expected output format
    expect(result).toEqual([
      'HTTPS host1.com:443',
      'HTTPS host3.com:443',
      'HTTPS host2.com:443',
      'HTTPS host4.com:443',
    ]);
  });

  test('should limit output to 10 entries if browser is undefined', () => {
    const servers = Array.from({ length: 15 }, (_, i) => ({
      host: `host${i + 1}.com`,
      port: 443,
    }));

    const pings = servers.map(({ host }, i) => ({
      host,
      valid: i % 2 === 0,
    }));

    // Simulate Chrome environment by setting browser to undefined
    global.browser = undefined;

    const result = getServersArray(servers, pings);

    // Expect that only 10 entries are returned
    expect(result.length).toBe(10);
  });

  // Test Disabled due to logic being disabled in the function under test
  test('should handle an empty pings array', () => {
    const servers = [
      { host: 'host1.com', port: 443 },
      { host: 'host2.com', port: 443 },
    ];

    const pings = [{ host: 'host1.com', valid: false }];

    const result = getServersArray(servers, pings);

    // Since pings are empty, all servers should be 'unchecked'
    expect(_.shuffle).toHaveBeenCalledWith([servers[0]]);
    expect(result).toEqual(['HTTPS host2.com:443', 'HTTPS host1.com:443']);
  });

  test('should return an empty array when servers input is empty', () => {
    const servers = [];
    const pings = [];

    const result = getServersArray(servers, pings);

    // Expect an empty array since there are no servers
    expect(result).toEqual([]);
  });
});
