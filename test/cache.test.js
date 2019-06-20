const cache = require('../src/cache');
jest.mock('fs');
jest.mock('os');
const fs = require('fs');
const os = require('os');

// Mock os
os.homedir = jest.fn(() => {
  return '/home/user';
});

const fixtures = {
  path: '/home/user/.kube/cache/kube-ldap-token.yaml',
  response: {
    apiVersion: 'client.authentication.k8s.io/v1alpha1',
    kind: 'ExecCredential',
    status: {
      token: 'foo',
      expirationTimestamp: Date.now() / 1000,
    },
  },
};

describe('getPath()', () => {
  test('gives the full path to the cache file', () => {
    expect(cache.getPath()).toEqual(fixtures.path);
  });
});

describe('hasResponse', () => {
  // Mock fs
  let responseExists = true;
  fs.existsSync = jest.fn(() => {
    return responseExists;
  });

  beforeEach(() => {
    responseExists = true;
  });

  test('returns true if there is a response cached', () => {
    expect(cache.hasResponse()).toBe(true);
  });
  test('returns false if there is no response cached', () => {
    responseExists = false;
    expect(cache.hasResponse()).toBe(false);
  });
});

describe('getResponse', () => {
  // Mock fs
  let response = fixtures.response;
  fs.readFileSync = jest.fn(() => {
    if (response) {
      return response;
    }
    throw new Error();
  });

  beforeEach(() => {
    response = fixtures.response;
  });

  test('returns the cached response if there is a response cached', () => {
    expect(cache.getResponse()).toEqual(fixtures.response);
  });
  test('returns null if there is no response cached', () => {
    response = null;
    expect(cache.getResponse()).toEqual(null);
  });
});

describe('cacheResponse', () => {
  // Mock fs
  let throwsError = false;
  fs.writeFile = jest.fn((path, data, errorCallback) => {
    if (throwsError) {
      errorCallback(new Error());
    }
  });

  beforeEach(() => {
    throwsError = false;
  });

  test('writes response to the cache', () => {
    const errorCallback = jest.fn();
    cache.cacheResponse(fixtures.response, errorCallback);
    expect(fs.writeFile).toHaveBeenCalledWith(fixtures.path, fixtures.response, expect.anything());
    expect(errorCallback).not.toHaveBeenCalled();
  });
  test('executes error callback if there\'s an error', () => {
    throwsError = true;
    const errorCallback = jest.fn();
    cache.cacheResponse(fixtures.response, errorCallback);
    expect(errorCallback).toHaveBeenCalled();
  });
});
