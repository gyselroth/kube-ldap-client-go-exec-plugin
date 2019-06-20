const jsonwebtoken = require('jsonwebtoken');
const fetch = require('node-fetch');
const btoa = require('btoa');

/** AuthenticationError. */
class AuthenticationError extends Error {
  /**
    * Create a point.
    * @param {number} code - The error code.
    * @param {string} message - The error message.
    * @param {string} fileName - The fileName the error occured.
    * @param {number} lineNumber - The lineNumber the error occured.
    */
  constructor(code, message, fileName, lineNumber) {
    super(message, fileName, lineNumber);
    this.code = code;
  }
}

const authenticate = (url, username, password) => {
  return new Promise((resolve, reject) => {
    const headers = new fetch.Headers();
    headers.append('Authorization', 'Basic ' + btoa(username + ':' + password));

    fetch(url + '/auth', {
      method: 'GET',
      headers: headers,
    }).then((response) => {
      if (response.status !== 200) {
        reject(new AuthenticationError(response.statusText, response.status));
      } else {
        response.text().then((token) => {
          const decodedToken = jsonwebtoken.decode(token);
          const expirationTimestamp = new Date(decodedToken.exp * 1000).toISOString();
          resolve(token, expirationTimestamp);
        }, (error) => {
          reject(new AuthenticationError(error.message, 400));
        });
      }
    }, (error) => {
      reject(new AuthenticationError(error.message, 400));
    });
  });
};

module.exports = {
  authenticate: authenticate,
  AuthenticationError: AuthenticationError,
};
