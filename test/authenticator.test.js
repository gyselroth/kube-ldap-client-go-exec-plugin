const btoa = require('btoa');
const authenticator = require('../src/authenticator');

jest.mock('node-fetch', () => {
  const mock = jest.genMockFromModule('node-fetch');
  console.log(mock);
  return mock;
});

const fixtures = {
  error: {
    message: 'custom error',
    code: 401,
  },
  authenticatedResponse: {

  },
  username: 'john.doe',
  password: 'secret',
  url: 'https://kube-ldap.example.org',
  fullUrl: () => {
    return fixtures.url + '/auth';
  },
  method: 'GET',
  authHeader: () => {
    return 'Authorization: ' + btoa(fixtures.username + ':' + fixtures.password);
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

describe('AuthenticationError', () => {
  test('Returns token and expiration timestamp if authenication succeeds', () => {
    expect.hasAssertions();
    authenticator.authenticate(
        fixtures.url,
        fixtures.username,
        fixtures.password
    ).then(() => {
      expect(fetch).toHaveBeenCalledWith(
          fixtures.fullUrl,
          {
            method: fixtures.method,
          }
      );
    }).catch(() => {
    });
  });
});
