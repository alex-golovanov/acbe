import { describe, beforeAll, afterAll, test, expect } from '@jest/globals';
import generate from './generate';

describe('Alarms Module', () => {
  beforeAll(() => {
    jest.useFakeTimers(); // Use fake timers provided by Jest
  });

  afterAll(() => {
    jest.useRealTimers(); // Restore real timers after all tests
  });

  test('.createOneTime', () => {
    const alarms = generate();
    const mockCallback = jest.fn();

    alarms.on(mockCallback);

    alarms.createOneTime('start', { delay: 1000 });

    // Move time forward by 1000 ms
    jest.advanceTimersByTime(1000);

    // Check that the callback was called
    expect(mockCallback).toHaveBeenCalledWith({ name: 'start' });
  });

  test('.createCycle no delay', () => {
    const alarms = generate();
    const mockCallback = jest.fn();

    alarms.on(mockCallback);

    alarms.createCycle('try1', { periodInMinutes: 1 });

    // Move time forward by 1 minute (60000 ms)
    jest.advanceTimersByTime(60000);

    // Check that the callback was called
    expect(mockCallback).toHaveBeenCalledWith({ name: 'try1' });
  });

  test('.createCycle with delay', () => {
    const alarms = generate();
    const mockCallback = jest.fn();

    alarms.on(mockCallback);

    alarms.createCycle('try2', {
      delay: 1000,
      periodInMinutes: 1,
    });

    // Move time forward by 1000 ms + 1 minute (61000 ms)
    jest.advanceTimersByTime(61000);

    // Check that the callback was called twice
    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback).toHaveBeenCalledWith({ name: 'try2' });
  });
});
