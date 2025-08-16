// @flow
const iniTextToArray = require('../../../iniTextToArray');

module.exports = (
  domainFileName /*: string*/,
  currentFileIncludes /*: Array<string>*/,
  ownTextList /*: Array<{ 'name': string, 'text': string }>*/,
) => {
  if (!currentFileIncludes.length) return currentFileIncludes;

  const ownFile = ownTextList.find((item) => item.name === domainFileName);

  if (!ownFile) return currentFileIncludes;

  let exceptions /*: Array<string> */ = [];

  exceptions = iniTextToArray(ownFile.text)
    .filter((row) => row.startsWith('exclude:'))
    .map((item) => item.replace(/^exclude\:/, ''));

  if (!exceptions.length) return currentFileIncludes;

  return currentFileIncludes.filter(
    (fileInclude) => !exceptions.includes(fileInclude),
  );
};
