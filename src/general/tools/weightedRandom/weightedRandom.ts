/**
 * Returns a random integer value between 0 (inclusive) and the specified maximum value (exclusive).
 *
 * @param {number} max - The upper limit of the random integer value.
 * @return {number} A random integer value between 0 and the specified maximum value.
 */
const randomInt = (max: integer): integer => Math.floor(Math.random() * max);


/**
 * Returns random array element using weights. Element weight should be stored in 'weight' property of array element.
 * If 'weight' property is absent then weight for this element is 1.
 *
 * @param {Array<T>} array - The array of objects to choose from.
 * @return {T} The randomly selected object.
 * @throws {Error} If there is an error with the weightedRandom return.
 * @template T - The type of the objects in the array.
 */
export const weightedRandom = <T extends { weight?: number }>(
  array: Array<T>,
): T => {
  let totalWeight = 0;

  let map = array.map(({ weight }) => {
    weight = weight || 1;
    let start = totalWeight;
    totalWeight += weight;

    return { start, end: totalWeight };
  });

  let random = randomInt(totalWeight);

  for (let i = 0; i < map.length; i++) {
    if (random >= map[i].start && random < map[i].end) {
      return array[i];
    }
  }

  throw new Error('Error with weightedRandom return');
};
