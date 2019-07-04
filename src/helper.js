const {URL} = require('url');
const process = require('process');

const checkUrl = (url, debug) => {
  if (!url) {
    throw new Error('no url given');
  }
  try {
    new URL(url);
  } catch (error) {
    if (debug) {
      process.stderr.write(error.stack + '\n');
    }
    throw new Error(`invalid url ${url}`);
  }
};

const dateFromEpoch = (epochTs) => {
  return new Date(epochTs * 1000);
};

module.exports = {
  checkUrl: checkUrl,
  dateFromEpoch: dateFromEpoch,
};
