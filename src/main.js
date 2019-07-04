const process = require('process');
const cli = require('./cli');
const authenticator = require('./authenticator');
const parser = require('./parser');
const cache = require('./cache');
const helper = require('./helper');

const run = (kubeLdapUrl) => {
  const debug = process.env.DEBUG === 'true';

  try {
    helper.checkUrl(kubeLdapUrl, debug);
  } catch (error) {
    cli.logError(error);
    cli.printUsageAndExit();
  }

  const execInfo = parser.parseExecInfo(process.env.KUBERNETES_EXEC_INFO);

  // No response or unauthenticated response in cache
  if (!cache.hasResponse() || (execInfo.spec.hasOwnProperty('response') && execInfo.spec.response.code === 401)) {
    cli.readUsernameAndPassword.then(({username, password}) => {
      authenticate(username, password, kubeLdapUrl);
    }).catch(cli.logError);
  } else {
    const response = cache.getResponse();
    // Response not expired
    if (response && helper.dateFromEpoch((JSON.parse(response)).status.expirationTimestamp) > new Date()) {
      process.stdout.write(response);
      process.exit();
    } else {
      cli.readUsernameAndPassword.then(({username, password}) => {
        authenticate(username, password, kubeLdapUrl);
      }).catch(cli.logError);
    }
  }
};

const authenticate = (username, password, url) => {
  authenticator.authenticate(url, username, password).then(({token, expirationTimestamp}) => {
    const response = JSON.stringify(
        parser.parseAuthenticatedResponse(token, expirationTimestamp)
    );
    cache.cacheResponse(response, (error) => {
      cli.logError(authenticationError);
    });
    process.stdout.write(response);
  }).catch((authenticationError) => {
    cli.logError(authenticationError);
    process.stdout.write(JSON.stringify(
        parser.parseUnauthenticatedResponse(authenticationError.code))
    );
  });
};

module.exports = {
  authenticate: authenticate,
  run: run,
};
