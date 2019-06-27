const btoa = require('btoa');
const jsonwebtoken = require('jsonwebtoken');
const fetch = require('jest-fetch-mock');
jest.setMock('node-fetch', fetch);
const authenticator = require('../src/authenticator');

const fixtures = {
  error: {
    message: 'custom error',
    code: 401,
  },
  authenticatedResponse: {
    data: {
      exp: Math.round(new Date() / 1000) + 3600,
    },
    jwt: () => {
      return jsonwebtoken.sign(fixtures.authenticatedResponse.data, 'secret');
    },
  },
  username: 'john.doe',
  password: 'secret',
  url: 'https://kube-ldap.example.org',
  fullUrl: () => {
    return fixtures.url + '/auth';
  },
  method: 'GET',
  authHeader: () => {
    return {
      Authorization: 'Basic ' +
        btoa(fixtures.username + ':' + fixtures.password),
    };
  },
};

describe('AuthenticationError', () => {
  test('message and code are set when creating new AuthenticationError', () => {
    const error = new authenticator.AuthenticationError(
        fixtures.error.code,
        fixtures.error.message
    );
    expect(error.message).toEqual(fixtures.error.message);
    expect(error.code).toEqual(fixtures.error.code);
  });
});

describe('authenticate', () => {
  const authenticate = (url, username, password, assertionCallback) => {
    return authenticator.authenticate(url, username, password)
        .then(({token, expirationTimestamp}) => {
          assertionCallback(token, expirationTimestamp);
        }).catch((error) => {
          throw error;
        });
  };

  test('Returns token and expiration timestamp if authenication succeeds', () => {
    fetch.mockResponseOnce(fixtures.authenticatedResponse.jwt(), {status: 200});

    expect.hasAssertions();
    return authenticate(
        fixtures.url,
        fixtures.username,
        fixtures.password,
        (token, expirationTimestamp) => {
          expect(fetch).toHaveBeenCalledWith(
              fixtures.fullUrl(),
              {
                headers: fixtures.authHeader(),
                method: fixtures.method,
              }
          );
          expect(token).toEqual(fixtures.authenticatedResponse.jwt());
          expect(expirationTimestamp).toEqual(
              new Date(fixtures.authenticatedResponse.data.exp * 1000).toISOString()
          );
        }
    );
  });

  test('Returns AuthenticationError if authenication fails', () => {
    fetch.mockResponseOnce({}, {status: 401});

    expect.hasAssertions();
    return expect(authenticate(
        fixtures.url,
        fixtures.username,
        fixtures.password,
        () => {
          expect(fetch).toHaveBeenCalledWith(
              fixtures.fullUrl(),
              {
                headers: fixtures.authHeader(),
                method: fixtures.method,
              }
          );
        }
    )).rejects.toEqual(new authenticator.AuthenticationError(401, 'Unauthorized'));
  });
});
