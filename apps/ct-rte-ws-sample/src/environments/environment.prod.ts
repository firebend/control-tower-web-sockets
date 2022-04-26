import config from './auth-config';

const { domain, clientId, audience, errorPath } = config as {
  domain: string;
  clientId: string;
  audience?: string;
  errorPath: string;
};

export const environment = {
  production: true,
  auth: {
    domain,
    clientId,
    audience,
    redirectUri: window.location.origin,
    errorPath
  },
  httpInterceptor: {
    allowedList: [`*`],
  },
};
