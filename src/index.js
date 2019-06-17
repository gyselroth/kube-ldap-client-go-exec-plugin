const fs = require('fs');
const path = require('path');
const os = require('os');
const jsonwebtoken = require('jsonwebtoken');
const readline = require('readline');
const Writable = require('stream').Writable;
const fetch = require('node-fetch');
const btoa = require('btoa');

const parseAuthenticatedResponse = (token, expirationTimestamp) => {
  const authenticatedTemplate = {
    apiVersion: 'client.authentication.k8s.io/v1alpha1',
    kind: 'ExecCredential',
    status: {
      token: null,
      expirationTimestamp: null,
    },
  };
  if (!expirationTimestamp) {
    delete authenticatedTemplate.status.expirationTimestamp;
  } else {
    authenticatedTemplate.status.expirationTimestamp = expirationTimestamp;
  }
  authenticatedTemplate.status.token = token;
  return authenticatedTemplate;
};

const parseUnauthenticatedResponse = (code) => {
  const unauthenticatedTemplate = {
    apiVersion: 'client.authentication.k8s.io/v1alpha1',
    kind: 'ExecCredential',
    spec: {
      response: {
        code: null,
      },
    },
    interactive: true,
  };
  unauthenticatedTemplate.spec.response.code = code;
  return unauthenticatedTemplate;
};

const authenticateInteractively = (url, cachePath) => {
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
      const headers = new fetch.Headers();
      headers.append('Authorization', 'Basic ' + btoa(username + ':' + password));

      fetch(url + '/auth', {
        method: 'GET',
        headers: headers,
      }).then((response) => {
        if (response.status !== 200) {
          process.stderr.write('Error: ' + response.statusText + '\n');
          process.stdout.write(JSON.stringify(parseUnauthenticatedResponse(response.status)));
        } else {
          response.text().then((token) => {
            const decodedToken = jsonwebtoken.decode(token);
            const expirationTimestamp = new Date(decodedToken.exp * 1000).toISOString();
            const response = JSON.stringify(parseAuthenticatedResponse(token, expirationTimestamp));
            fs.writeFile(cachePath, response, (error) => {
              if (error) {
                console.log('error while caching token: ' + error.message);
              }
            });
            process.stdout.write(response);
          }, (error) => {
            process.stderr.write('Error: ' + error.message + '\n');
            process.stdout.write(JSON.stringify(parseUnauthenticatedResponse(400)));
          });
        }
      }, (error) => {
        process.stderr.write('Error: ' + error.message + '\n');
        process.stdout.write(JSON.stringify(parseUnauthenticatedResponse(400)));
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

const main = () => {
  const debug = process.env.DEBUG === 'true';
  let kubeLdapUrl = null;
  const program = require('commander');
  program.arguments('<url>').action((url) => {
    kubeLdapUrl = url;
  });
  program.parse(process.argv);

  if (!kubeLdapUrl) {
    printUsageAndExit();
  }

  try {
    new URL(kubeLdapUrl);
  } catch (error) {
    process.stderr.write(`Error: invalid url ${kubeLdapUrl}\n`);
    if (debug) {
      process.stderr.write(error.stack + '\n');
    }
    printUsageAndExit();
  }

  const execInfo = process.env.KUBERNETES_EXEC_INFO ?
    JSON.parse(process.env.KUBERNETES_EXEC_INFO) : {
      spec: {
        response: {
          code: 401,
        },
      },
    };
  const cachePath = path.join(os.homedir(), '.kube', 'cache', 'kube-ldap-token.yaml');
  if (!fs.existsSync(cachePath) || (execInfo.spec.hasOwnProperty('response') && execInfo.spec.response.code === 401)) {
    authenticateInteractively(kubeLdapUrl, cachePath);
  } else {
    const response = fs.readFileSync(cachePath, {
      'encoding': 'utf8',
    });
    if (new Date((JSON.parse(response)).status.expirationTimestamp) > new Date()) {
      process.stdout.write(response);
      process.exit();
    } else {
      authenticateInteractively(kubeLdapUrl, cachePath);
    }
  }
};

main();
