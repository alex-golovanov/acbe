import { describe, test, beforeEach, expect, jest } from '@jest/globals';
import { checkUrlInList } from './checkUrlInList';
import urlToDomain from 'tools/urlToDomain';

// Mock the urlToDomain function
jest.mock('tools/urlToDomain', () => jest.fn());

describe('checkUrlInList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return true for exact match', () => {
    // not CONTENT_SCRIPT_DOMAINS
    urlToDomain.mockReturnValue('example.com');
    expect(checkUrlInList('https://example.com/page')).toBe(false);
    expect(checkUrlInList('http://example.com')).toBe(false);
    expect(checkUrlInList('example.com')).toBe(false);
    // is CONTENT_SCRIPT_DOMAINS
    urlToDomain.mockReturnValue('bbc.com');
    expect(checkUrlInList('https://bbc.com/page')).toBe(true);
    expect(checkUrlInList('http://bbc.com')).toBe(true);
  });

  test('should return true for subdomains', () => {
    // not CONTENT_SCRIPT_DOMAINS
    urlToDomain.mockReturnValue('sub.example.com');
    expect(checkUrlInList('https://sub.example.com/page')).toBe(false);
    expect(checkUrlInList('http://sub.example.com')).toBe(false);
    // is CONTENT_SCRIPT_DOMAINS
    urlToDomain.mockReturnValue('subdomain.bbc.com');
    expect(checkUrlInList('https://subdomain.bbc.com/page')).toBe(true);
    expect(checkUrlInList('http://subdomain.bbc.com')).toBe(true);
  });

  test('should return false for domains not in the list', () => {
    urlToDomain.mockReturnValue('not-in-list.com');

    expect(checkUrlInList('https://not-in-list.com/page')).toBe(false);
    expect(checkUrlInList('http://not-in-list.com')).toBe(false);
  });

  test('should return false for undefined or null urls', () => {
    urlToDomain.mockReturnValue(undefined);

    expect(checkUrlInList(undefined)).toBe(false);
    expect(checkUrlInList(null)).toBe(false);
  });

  test('should handle urls without domain properly', () => {
    urlToDomain.mockReturnValue('');

    expect(checkUrlInList('http://')).toBe(false);
    expect(checkUrlInList('')).toBe(false);
  });

  test('should handle edge cases', () => {
    urlToDomain.mockReturnValue('bbc.com');
    expect(checkUrlInList('https://bbc.com/page')).toBe(true);

    urlToDomain.mockReturnValue('bbc.co.uk');
    expect(checkUrlInList('https://bbc.co.uk/page')).toBe(true);

    // Check subdomains of a domain that is not in the list
    urlToDomain.mockReturnValue('sub.not-in-list.com');
    expect(checkUrlInList('https://sub.not-in-list.com/page')).toBe(false);
  });
});
