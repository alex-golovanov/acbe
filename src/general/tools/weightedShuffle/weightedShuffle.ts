import { weightedRandom } from '../weightedRandom/weightedRandom';

/**
 * Return shuffled array with attention to element weights.
 * Element weight should be stored in 'weight' property of array element.
 * If 'weight' property is absent then weight for this element is 1.
 * Original array is not modified.
 *
 * @param {Object[]} array - The input array, where each object may have a 'weight' property.
 * @return {Object[]} A new array with the elements of the input array in a random order.
 */
export const weightedShuffle = <T extends { weight?: number }>(
  array: T[],
): T[] => {
  let arrayClone = array.slice();
  let result = [];

  for (let i = 0; i < array.length; i++) {
    let item = weightedRandom(arrayClone);
    result.push(item);
    arrayClone.splice(arrayClone.indexOf(item), 1);
  }

  return result;
};
