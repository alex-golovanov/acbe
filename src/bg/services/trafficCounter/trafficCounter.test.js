import { describe, beforeEach, test, expect, jest } from '@jest/globals';
import ga from 'ga';
import jitsu from 'jitsu';
import storage from 'storage';
import { trafficCounter } from './trafficCounter';

jest.mock('ga');
jest.mock('jitsu');
jest.mock('storage');

jest.mock('ga', () => ({
  full: jest.fn(),
}));

describe('trafficCounter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.get.mockResolvedValue(0); // Mock initial storage value
  });

  test('should initialize size from storage', async () => {
    const initialSize = await trafficCounter.get();
    expect(initialSize).toBe(0);
    expect(trafficCounter.size).toBe(0);
    expect(trafficCounter.delayedSize).toBe(0);
    expect(trafficCounter.initiated).toBe(true);
  });

  test('should add size correctly and send analytics', () => {
    trafficCounter.add(5 * Math.pow(1024, 2)); // Add 5 MB
    expect(trafficCounter.size).toBe(5 * Math.pow(1024, 2));
    expect(trafficCounter.delayedSize).toBe(0);

    // Now adding 5 MB should not trigger analytics
    trafficCounter.add(4 * Math.pow(1024, 2));
    expect(ga.full).not.toHaveBeenCalled();
    expect(jitsu.track).not.toHaveBeenCalled();

    // Now add 1 MB to trigger analytics
    trafficCounter.add(Math.pow(1024, 2)); // Add 1 MB
    expect(ga.full).toHaveBeenCalledWith({ category: 'traffic', action: '10mb' });
    expect(jitsu.track).toHaveBeenCalledWith('traffic_in', { value: '10mb' });
  });

  test('should call listeners when size is updated', () => {
    const listener = jest.fn();
    trafficCounter.addListener(listener);

    trafficCounter.add(5 * Math.pow(1024, 2)); // Add 5 MB plus 10mb previous
    expect(listener).toHaveBeenCalledWith(15 * Math.pow(1024, 2), 10 * Math.pow(1024, 2)); // Recent and old sizes

    trafficCounter.add(3 * Math.pow(1024, 2)); // Add 3 MB plus 15mb previous
    expect(listener).toHaveBeenCalledWith(18 * Math.pow(1024, 2), 15 * Math.pow(1024, 2)); // New recent and old sizes
  });

  test('should remove listeners correctly', () => {
    const listener = jest.fn();
    trafficCounter.addListener(listener);
    trafficCounter.removeListener(listener);

    // Trigger size change
    trafficCounter.add(5 * Math.pow(1024, 2));
    expect(listener).not.toHaveBeenCalled(); // Listener should not be called
  });

  test('should handle adding size when not initiated', async () => {
    // Ensure not initiated
    trafficCounter.delayedSize = 0;
    trafficCounter.size = 0;
    trafficCounter.initiated = false;

    trafficCounter.add(10 * Math.pow(1024, 2)); // Add 10 MB

    expect(trafficCounter.delayedSize).toBe(10 * Math.pow(1024, 2));
    expect(trafficCounter.size).toBe(0); // Size should still be 0 until initiated
  });

  test('should return correct size from get() method', async () => {
    trafficCounter.delayedSize = 0;
    trafficCounter.size = 0;
    trafficCounter.initiated = false;

    const size = await trafficCounter.get();
    expect(size).toBe(0);
    expect(trafficCounter.size).toBe(0);
    expect(trafficCounter.delayedSize).toBe(0);
  });
});
