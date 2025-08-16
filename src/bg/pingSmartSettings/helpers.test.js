import { describe, test, expect } from '@jest/globals';
import smartSettingsHelpers from './helpers';

const filters = [
  {
    proxyMode: true,
    country: 'nl',
    format: 'full domain',
    server: 'bg.v4.a.dl.ws.microsoft.com',
  },
  {
    proxyMode: true,
    country: 'nz',
    format: 'full domain',
    server: 'bg4.v4.a.dl.ws.microsoft.com',
  },
  {
    proxyMode: false,
    country: 'it',
    format: 'full domain',
    server: 'b.c2r.ts.cdn.office.net',
  },
  {
    proxyMode: false,
    country: 'at',
    format: 'full domain',
    server: 'chat.openai.com.cdn.cloudflare.net',
  },
  {
    proxyMode: true,
    country: 'lv',
    format: 'full domain',
    server: 'f.c2r.ts.cdn.office.net',
  },
  {
    proxyMode: true,
    country: 'lv',
    format: 'full domain',
    value: 'c.android.clients.google.com',
  },
];

describe('Smart Settings helpers', () => {
  test('getSmartSettingsFakeHosts should be defined', () => {
    expect(smartSettingsHelpers.getSmartSettingsFakeHosts).toBeDefined();
  });
  test('getSmartSettingsFakeHosts should return an array of fake hosts w/o proxy country in direct mode', () => {
    const fakeHosts = smartSettingsHelpers.getSmartSettingsFakeHosts(
      filters,
      'direct',
      null,
    );
    expect(fakeHosts.length).toBe(3);
    expect(fakeHosts).toEqual([
      {
        country: 'nl',
        format: 'domain',
        value: 'nl.httpstat.us',
      },
      {
        country: 'nz',
        format: 'domain',
        value: 'nz.httpstat.us',
      },
      {
        country: 'lv',
        format: 'domain',
        value: 'lv.httpstat.us',
      },
    ]);
  });
  test('getSmartSettingsFakeHosts should return an array of fake hosts with proxy country in direct mode', () => {
    const fakeHosts = smartSettingsHelpers.getSmartSettingsFakeHosts(
      filters,
      'direct',
      'lt',
    );
    expect(fakeHosts.length).toBe(3);
    expect(fakeHosts).toEqual([
      {
        country: 'nl',
        format: 'domain',
        value: 'nl.httpstat.us',
      },
      {
        country: 'nz',
        format: 'domain',
        value: 'nz.httpstat.us',
      },
      {
        country: 'lv',
        format: 'domain',
        value: 'lv.httpstat.us',
      },
    ]);
  });
  test('getSmartSettingsFakeHosts should return an array of fake hosts with proxy country (non in smarts)', () => {
    const fakeHosts = smartSettingsHelpers.getSmartSettingsFakeHosts(
      filters,
      'proxy',
      'lt',
    );
    expect(fakeHosts.length).toBe(4);
    expect(fakeHosts).toEqual([
      {
        country: 'nl',
        format: 'domain',
        value: 'nl.httpstat.us',
      },
      {
        country: 'nz',
        format: 'domain',
        value: 'nz.httpstat.us',
      },
      {
        country: 'lv',
        format: 'domain',
        value: 'lv.httpstat.us',
      },
      {
        country: 'lt',
        format: 'domain',
        value: 'lt.httpstat.us',
      },
    ]);
  });
  test('getSmartSettingsFakeHosts should return an array of fake hosts with proxy country (already in smarts)', () => {
    const fakeHosts = smartSettingsHelpers.getSmartSettingsFakeHosts(
      filters,
      'proxy',
      'nl',
    );
    expect(fakeHosts.length).toBe(3);
    expect(fakeHosts).toEqual([
      {
        country: 'nl',
        format: 'domain',
        value: 'nl.httpstat.us',
      },
      {
        country: 'nz',
        format: 'domain',
        value: 'nz.httpstat.us',
      },
      {
        country: 'lv',
        format: 'domain',
        value: 'lv.httpstat.us',
      },
    ]);
  });
});
