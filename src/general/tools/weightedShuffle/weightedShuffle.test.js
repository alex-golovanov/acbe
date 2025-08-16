import { describe, test, expect } from '@jest/globals';
import { weightedShuffle } from './weightedShuffle';
import { weightedRandom } from '../weightedRandom/weightedRandom';

// Mocking the weightedRandom function to control its output
jest.mock('../weightedRandom/weightedRandom');

describe('weightedShuffle', () => {
  test('should return a shuffled array with attention to weights', () => {
    const array = [
      { value: 'A', weight: 1 },
      { value: 'B', weight: 2 },
      { value: 'C', weight: 3 },
    ];

    // Mocking the behavior of weightedRandom to return elements in a specific order
    weightedRandom
      .mockReturnValueOnce({ value: 'C', weight: 3 })
      .mockReturnValueOnce({ value: 'B', weight: 2 })
      .mockReturnValueOnce({ value: 'A', weight: 1 });

    const result = weightedShuffle(array);

    // Check if the result is correctly shuffled with the given weights
    expect(result).toEqual([
      { value: 'C', weight: 3 },
      { value: 'B', weight: 2 },
      { value: 'A', weight: 1 },
    ]);

    // Ensure the original array is not modified
    expect(array).toEqual([
      { value: 'A', weight: 1 },
      { value: 'B', weight: 2 },
      { value: 'C', weight: 3 },
    ]);
  });

  test('should return an array of the same length', () => {
    const array = [
      { value: 'A', weight: 1 },
      { value: 'B', weight: 2 },
      { value: 'C', weight: 3 },
    ];

    weightedRandom
      .mockReturnValueOnce({ value: 'C', weight: 3 })
      .mockReturnValueOnce({ value: 'A', weight: 1 })
      .mockReturnValueOnce({ value: 'B', weight: 2 });

    const result = weightedShuffle(array);

    // Check if the shuffled array has the same length as the original
    expect(result).toHaveLength(array.length);
  });

  test('should handle elements without weight', () => {
    const array = [
      { value: 'A' }, // weight defaults to 1
      { value: 'B' }, // weight defaults to 1
      { value: 'C', weight: 3 },
    ];

    weightedRandom
      .mockReturnValueOnce({ value: 'C', weight: 3 })
      .mockReturnValueOnce({ value: 'A' })
      .mockReturnValueOnce({ value: 'B' });

    const result = weightedShuffle(array);

    // Check if the result is correctly shuffled with the given weights
    expect(result).toEqual([
      { value: 'C', weight: 3 },
      { value: 'A' },
      { value: 'B' },
    ]);
  });

  test('should return an empty array when input is empty', () => {
    const array = [];

    const result = weightedShuffle(array);

    // The result should be an empty array
    expect(result).toEqual([]);
  });

  test('should work with a single element array', () => {
    const array = [{ value: 'A', weight: 1 }];

    weightedRandom.mockReturnValueOnce({ value: 'A', weight: 1 });

    const result = weightedShuffle(array);

    // Ensure the result is the same single element array
    expect(result).toEqual([{ value: 'A', weight: 1 }]);

    // Ensure the original array remains unchanged
    expect(array).toEqual([{ value: 'A', weight: 1 }]);
  });
});
