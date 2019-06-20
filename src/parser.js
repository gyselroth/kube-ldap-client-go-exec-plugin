const parseAuthenticatedResponse = (token, expirationTimestamp) => {
  if (!token) {
    throw new Error('no token given');
  }
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
  if (!code) {
    throw new Error('no code given');
  }
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

const parseExecInfo = (env) => {
  return env ?
    JSON.parse(env) : {
      spec: {
        response: {
          code: 401,
        },
      },
    };
};

module.exports = {
  parseAuthenticatedResponse: parseAuthenticatedResponse,
  parseUnauthenticatedResponse: parseUnauthenticatedResponse,
  parseExecInfo: parseExecInfo,
};
