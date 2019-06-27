const {URL} = require('url');
const readline = require('readline');
const Writable = require('stream').Writable;
const program = require('commander');
const authenticator = require('./authenticator');
const parser = require('./parser');
const cache = require('./cache');

const main = (kubeLdapUrl) => {
  const debug = process.env.DEBUG === 'true';

  try {
    checkUrl(kubeLdapUrl, debug);
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    printUsageAndExit();
  }

  const execInfo = parser.parseExecInfo(process.env.KUBERNETES_EXEC_INFO);

  if (!cache.hasResponse() || (execInfo.spec.hasOwnProperty('response') && execInfo.spec.response.code === 401)) {
    authenticateInteractively(kubeLdapUrl);
  } else {
    const response = cache.getResponse();
    if (response && new Date((JSON.parse(response)).status.expirationTimestamp) > new Date()) {
      process.stdout.write(response);
      process.exit();
    } else {
      authenticateInteractively(kubeLdapUrl);
    }
  }
};

const authenticateInteractively = (url) => {
  const mutableStderr = new Writable({
    write: function(chunk, encoding, callback) {
      if (!this.muted) {
        process.stderr.write(chunk, encoding);
      }
      callback();
    },
  });

  mutableStderr.muted = false;

  const input = readline.createInterface({
    input: process.stdin,
    output: mutableStderr,
    terminal: true,
  });

  input.question('Username: ', function(username) {
    input.question('Password:', function(password) {
      process.stderr.write('\n');

      authenticator.authenticate(url, username, password).then(({token, expirationTimestamp}) => {
        const response = JSON.stringify(
            parser.parseAuthenticatedResponse(token, expirationTimestamp)
        );
        cache.cacheResponse(response, (error) => {
          process.stderr.write('Error: ' + error.message + '\n');
        });
        process.stdout.write(response);
      }).catch((authenticationError) => {
        process.stderr.write('Error: ' + authenticationError.message + '\n');
        process.stdout.write(JSON.stringify(
            parser.parseUnauthenticatedResponse(authenticationError.code))
        );
      });

      input.close();
    });
    mutableStderr.muted = true;
  });
};

const printUsageAndExit = () => {
  process.stderr.write('Usage: ' + process.argv0 + ' KUBE-LDAP_URL\n');
  process.exit(1);
};

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

const readUrlFromArgs = (callback) => {
  program.arguments('<url>').action((url) => {
    callback(url);
  });
  program.parse(process.argv);
};

readUrlFromArgs(main);
