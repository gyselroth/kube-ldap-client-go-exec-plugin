const process = require('process');
const readline = require('readline');
const Writable = require('stream').Writable;
const program = require('commander');

const logError = (error) => {
  process.stderr.write(`Error: ${error.message}\n`);
};

const printUsageAndExit = () => {
  process.stderr.write('Usage: ' + process.argv0 + ' KUBE-LDAP_URL\n');
  process.exit(1);
};

const readUsernameAndPassword = () => {
  return new Promise((resolve, reject) => {
    const mutableStderr = new Writable({
      write: (chunk, encoding, callback) => {
        if (!mutableStderr.muted) {
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

    input.question('Username: ', (username) => {
      input.question('Password:', (password) => {
        process.stderr.write('\n');

        resolve({
          username: username,
          password: password,
        });

        input.close();
      });
      mutableStderr.muted = true;
    });
  });
};

const readUrlFromArgs = (callback) => {
  let hasUrlArg = false;
  program.arguments('<url>').action((url) => {
    hasUrlArg = true;
    callback(url);
  });
  program.parse(process.argv);
  if (!hasUrlArg) {
    printUsageAndExit();
  }
};

module.exports = {
  logError: logError,
  printUsageAndExit: printUsageAndExit,
  readUsernameAndPassword: readUsernameAndPassword,
  readUrlFromArgs: readUrlFromArgs,
};
