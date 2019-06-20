const fs = require('fs');
const path = require('path');
const os = require('os');

const getPath = () => {
  return path.join(os.homedir(), '.kube', 'cache', 'kube-ldap-token.yaml');
};

const hasResponse = () => {
  return fs.existsSync(getPath());
};

const getResponse = () => {
  try {
    return fs.readFileSync(getPath(), {
      'encoding': 'utf8',
    });
  } catch (error) {
    return null;
  }
};

const cacheResponse = (response, errorCallback) => {
  fs.writeFile(getPath(), response, (error) => {
    if (error) {
      errorCallback(error);
    }
  });
};

module.exports = {
  getPath: getPath,
  hasResponse: hasResponse,
  getResponse: getResponse,
  cacheResponse: cacheResponse,
};
