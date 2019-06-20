const parser = require('../src/parser');

describe('parseAuthenticatedResponse', () => {
  const fixtures = {
    token: 'token',
    expirationTimestamp: Date.now() / 1000,
    responseWithExpirationTimestamp: () => {
      return {
        apiVersion: 'client.authentication.k8s.io/v1alpha1',
        kind: 'ExecCredential',
        status: {
          token: fixtures.token,
          expirationTimestamp: fixtures.expirationTimestamp,
        },
      };
    },
    responseWithoutExpirationTimestamp: () => {
      return {
        apiVersion: 'client.authentication.k8s.io/v1alpha1',
        kind: 'ExecCredential',
        status: {
          token: fixtures.token,
        },
      };
    },
    noTokenErrorMessage: 'no token given',
  };
  test('withExpirationTimestamp', () => {
    const response = parser.parseAuthenticatedResponse(
        fixtures.token,
        fixtures.expirationTimestamp
    );
    expect(response).toEqual(fixtures.responseWithExpirationTimestamp());
  });
  test('withoutExpirationTimestamp', () => {
    const response = parser.parseAuthenticatedResponse(
        fixtures.token
    );
    expect(response).toEqual(fixtures.responseWithoutExpirationTimestamp());
  });
  test('withoutToken', () => {
    expect(() => {
      parser.parseAuthenticatedResponse();
    }).toThrowError(new Error(fixtures.noTokenErrorMessage));
  });
});

describe('parseUnauthenticatedResponse', () => {
  const fixtures = {
    code: 'code',
    response: () => {
      return {
        apiVersion: 'client.authentication.k8s.io/v1alpha1',
        kind: 'ExecCredential',
        spec: {
          response: {
            code: fixtures.code,
          },
        },
        interactive: true,
      };
    },
    noCodeErrorMessage: 'no code given',
  };
  test('withCode', () => {
    const response = parser.parseUnauthenticatedResponse(
        fixtures.code
    );
    expect(response).toEqual(fixtures.response());
  });
  test('withoutCode', () => {
    expect(() => {
      parser.parseUnauthenticatedResponse();
    }).toThrowError(new Error(fixtures.noCodeErrorMessage));
  });
});
