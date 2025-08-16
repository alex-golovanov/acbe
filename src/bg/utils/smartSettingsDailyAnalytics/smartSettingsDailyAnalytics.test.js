import { describe, beforeEach, test, expect, jest } from '@jest/globals';
import timemarks from 'bg/timemarks';
import jitsu from 'jitsu';
import ga from 'ga';
import findMatchingFilterForDomain from 'tools/findMatchingFilterForDomain';
import urlToDomain from 'tools/urlToDomain';
import { smartSettingsDailyAnalytics } from './smartSettingsDailyAnalytics';

jest.mock('bg/timemarks');
jest.mock('jitsu');
jest.mock('tools/findMatchingFilterForDomain');
jest.mock('tools/urlToDomain');

jest.mock('ga', () => ({
  full: jest.fn(),
}));

const pac = {
  filters: [
    { domain: 'example.com' },
    { domain: 'example.org' },
  ],
};

describe('smartSettingsDailyAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return if the mark is still within the 24-hour window', async () => {
    timemarks.getCached.mockReturnValueOnce(Date.now());

    await smartSettingsDailyAnalytics('http://example.com', pac);

    expect(jitsu.track).not.toHaveBeenCalled();
    expect(timemarks.setCached).not.toHaveBeenCalled();
  });

  test('should return if no URL is provided', async () => {
    timemarks.getCached.mockReturnValueOnce(0);

    await smartSettingsDailyAnalytics('', pac);

    expect(urlToDomain).not.toHaveBeenCalled();
    expect(jitsu.track).not.toHaveBeenCalled();
    expect(timemarks.setCached).not.toHaveBeenCalled();
  });

  test('should return if the domain cannot be extracted from the URL', async () => {
    timemarks.getCached.mockReturnValueOnce(0);
    urlToDomain.mockReturnValueOnce(null);

    await smartSettingsDailyAnalytics('http://example.com', pac);

    expect(findMatchingFilterForDomain).not.toHaveBeenCalled();
    expect(jitsu.track).not.toHaveBeenCalled();
    expect(timemarks.setCached).not.toHaveBeenCalled();
  });

  test('should send analytics if a matching smart settings domain is found', async () => {
    timemarks.getCached.mockReturnValueOnce(0);
    urlToDomain.mockReturnValueOnce('example.com');
    findMatchingFilterForDomain.mockReturnValueOnce(true);

    await smartSettingsDailyAnalytics('http://example.com', pac);

    expect(timemarks.setCached).toHaveBeenCalledWith('GA Rare smartSettingsUseDaily');
    expect(ga.full).toHaveBeenCalledWith({
      category: 'smartSettings',
      action: 'smartSettingsUseDaily',
    });
    expect(jitsu.track).toHaveBeenCalledWith('smartSettingsUseDaily');
  });

  test('should not send analytics if no matching smart settings domain is found', async () => {
    timemarks.getCached.mockReturnValueOnce(0);
    urlToDomain.mockReturnValueOnce('example.net');
    findMatchingFilterForDomain.mockReturnValueOnce(false);

    await smartSettingsDailyAnalytics('http://example.net', pac);

    expect(timemarks.setCached).not.toHaveBeenCalled();
    expect(jitsu.track).not.toHaveBeenCalled();
  });
});
