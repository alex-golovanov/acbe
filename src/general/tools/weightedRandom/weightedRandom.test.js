import { describe, test, expect } from '@jest/globals';
import { weightedRandom } from './weightedRandom';

// Mocking randomInt function to control the output
jest.mock('./weightedRandom', () => ({
  ...jest.requireActual('./weightedRandom'),
}));

describe('weightedRandom', () => {
  // Helper function to test weight distribution
  const getDistribution = (array, iterations) => {
    const counts = array.reduce((acc, { value }) => {
      acc[value] = 0;
      return acc;
    }, {});

    for (let i = 0; i < iterations; i++) {
      const element = weightedRandom(array);
      counts[element.value]++;
    }

    return counts;
  };

  test('should handle the given fixture with weights', () => {
    const array = [
      { value: 'nl31.trafcfy.com', port: 901, weight: 2 },
      { value: 'nl32.trafcfy.com', port: 901, weight: 2 },
      { value: 'nl33.trafcfy.com', port: 901, weight: 2 },
      { value: 'nl34.trafcfy.com', port: 901, weight: 2 },
      { value: 'nl35.trafcfy.com', port: 901, weight: 2 },
      { value: 'nl36.trafcfy.com', port: 901, weight: 2 },
      { value: 'nl37.trafcfy.com', port: 901, weight: 2 },
      { value: 'nl38.trafcfy.com', port: 901, weight: 2 },
      { value: 'nl39.trafcfy.com', port: 901, weight: 2 },
      { value: 'nl40.trafcfy.com', port: 901, weight: 2 },
      { value: 'nl41.trafcfy.com', port: 901 },
      { value: 'nl42.trafcfy.com', port: 901 },
      { value: 'nl43.trafcfy.com', port: 901 },
      { value: 'nl44.trafcfy.com', port: 901 },
      { value: 'nl45.trafcfy.com', port: 901 },
      { value: 'nl63.trafcfy.com', port: 901 },
      { value: 'nl64.trafcfy.com', port: 901 },
      { value: 'nl65.trafcfy.com', port: 901 },
      { value: 'nl69.trafcfy.com', port: 901 },
      { value: 'nl70.trafcfy.com', port: 901 },
    ];

    // Perform a large number of iterations to get a good distribution
    const counts = getDistribution(array, 10000);

    // Calculate the total weight
    const totalWeight = array.reduce((sum, { weight = 1 }) => sum + weight, 0);

    // Check if distribution is approximately correct
    array.forEach(({ value, weight = 1 }) => {
      const expectedPercentage = weight / totalWeight;
      const actualPercentage = counts[value] / 10000;
      expect(Math.abs(expectedPercentage - actualPercentage)).toBeLessThan(
        0.05,
      ); // Allow some tolerance
    });
  });

  test('should return an element with correct weight distribution', () => {
    const array = [
      { value: 'A', weight: 1 },
      { value: 'B', weight: 2 },
      { value: 'C', weight: 3 },
    ];

    // Perform a large number of iterations to get a good distribution
    const counts = getDistribution(array, 10000);

    // Check if distribution is approximately correct
    const total = array.reduce((sum, { weight }) => sum + weight, 0);

    Object.keys(counts).forEach((value) => {
      const expectedPercentage =
        array.find((item) => item.value === value).weight / total;
      const actualPercentage = counts[value] / 10000;
      expect(Math.abs(expectedPercentage - actualPercentage)).toBeLessThan(
        0.05,
      ); // Allow some tolerance
    });
  });

  test('should handle cases where weights are not specified', () => {
    const array = [
      { value: 'A' }, // weight defaults to 1
      { value: 'B' }, // weight defaults to 1
      { value: 'C' }, // weight defaults to 1
    ];

    const counts = getDistribution(array, 10000);

    // All items should be equally likely
    const expectedPercentage = 1 / array.length;
    const actualPercentage = counts[array[0].value] / 10000;
    expect(Math.abs(expectedPercentage - actualPercentage)).toBeLessThan(0.05);
  });

  test('should throw an error if array is empty', () => {
    expect(() => weightedRandom([])).toThrow(
      'Error with weightedRandom return',
    );
  });
});
