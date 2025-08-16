import { test, expect } from '@jest/globals';
import algorithm from './algorithm';

jest.useFakeTimers();

test('Return is promise', () => {
  expect(algorithm([Promise.resolve()]) instanceof Promise).toBe(true);
});

test('First responded with delay lower than 5 seconds', async () => {
  expect.assertions(1);

  const data = [
    new Promise((resolve) => setTimeout(resolve, 3000)),
    new Promise((resolve) => setTimeout(resolve, 7000)),
    new Promise((resolve) => setTimeout(resolve, 8000)),
  ];

  const promise = algorithm(data);

  jest.advanceTimersByTime(5000);
  jest.runAllTimers();

  const index = await promise;
  expect(index).toBe(0);
});

test('Only second responded with delay lower than 5 seconds', async () => {
  expect.assertions(1);

  const data = [
    new Promise((resolve) => setTimeout(resolve, 7000)),
    new Promise((resolve) => setTimeout(resolve, 2000)),
    new Promise((resolve) => setTimeout(resolve, 8000)),
  ];

  const promise = algorithm(data);

  jest.advanceTimersByTime(5000);
  jest.runAllTimers();

  const index = await promise;
  expect(index).toBe(1);
});

test('Only third responded with delay lower than 5 seconds', async () => {
  expect.assertions(1);

  const data = [
    new Promise((resolve) => setTimeout(resolve, 10000)),
    new Promise((resolve) => setTimeout(resolve, 9000)),
    new Promise((resolve) => setTimeout(resolve, 4000)),
  ];

  const promise = algorithm(data);

  jest.advanceTimersByTime(5000);
  jest.runAllTimers();

  const index = await promise;
  expect(index).toBe(2);
});

test('All responses more than 5 seconds', async () => {
  expect.assertions(1);

  const data = [
    new Promise((resolve) => setTimeout(resolve, 10000)),
    new Promise((resolve) => setTimeout(resolve, 9000)),
    new Promise((resolve) => setTimeout(resolve, 8000)),
  ];

  const promise = algorithm(data);

  jest.advanceTimersByTime(5000);
  jest.runAllTimers();

  const index = await promise;
  expect(index).toBe(0);
});

test('All responses are errors', async () => {
  expect.assertions(1);

  const data = [
    Promise.reject(new Error('1')).catch(() => undefined),
    Promise.reject(new Error('2')).catch(() => undefined),
    Promise.reject(new Error('3')).catch(() => undefined),
  ];

  await expect(algorithm(data)).resolves.toBe(0);
});
