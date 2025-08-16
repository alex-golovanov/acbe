const { createTask } = require('../taskFunctions');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const gistsConfig = require('./gists.json');

const TOKEN_PATH = path.join(__dirname, '.github-token');

const getToken = () => {
  try {
    return fs.readFileSync(TOKEN_PATH, 'utf8').trim();
  } catch (error) {
    console.error('Error reading GitHub token:', error.message);
    process.exit(1);
  }
};

const updateGist = async (gist) => {
  const { comment, gistUid, filename, content } = gist;
  const token = getToken();
  const url = `https://api.github.com/gists/${gistUid}`;

  const formattedContent = JSON.stringify(content, null, 2);

  try {
    await axios.patch(
      url,
      {
        files: {
          [filename]: { content: formattedContent }
        }
      },
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    console.log(`Successfully updated: ${comment} (${gistUid})`);
  } catch (error) {
    console.error(`Failed to update gist: ${comment} (${gistUid})`);
    console.error(error.response ? error.response.data : error.message);
  }
};

createTask('upload-gists', async () => {
  if (!fs.existsSync(TOKEN_PATH)) {
    console.error('Error: .github-token file is missing. Please create it and add your GitHub token.');
    process.exit(1);
  }

  for (const gist of gistsConfig) {
    if (gist.SKIP) {
      console.log(`Skipping gist: ${gist.comment}`);
      continue;
    }

    await updateGist(gist);
  }
});
