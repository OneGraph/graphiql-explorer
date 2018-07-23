// @flow
const DEV = process.env.NODE_ENV === 'development';

const appId = '0b33e830-7cde-4b90-ad7e-2a39c57c0e11';

const sandboxId = '0b33e830-7cde-4b90-ad7e-2a39c57c0e11';

const baseUrl = new URL('https://serve.onegraph.com');

if (DEV) {
  baseUrl.hostname = 'serve.onegraph.io';
}

const fetchUrl = new URL(baseUrl.toString());
fetchUrl.pathname = '/dynamic';

function authUrl(service: string): string {
  const url = new URL(baseUrl.toString());
  url.pathname = '/oauth/start';
  url.searchParams.append('service', service);
  url.searchParams.append('app_id', sandboxId);
  url.searchParams.append('redirect_origin', window.location.origin);
  return url.toString();
}

type Config = {
  isDev: boolean,
  appId: string,
  oneGraphOrigin: string,
  fetchUrl: string,
  authUrl: (service: string) => string,
};

const config: Config = {
  isDev: DEV,
  appId,
  oneGraphOrigin: baseUrl.toString(),
  fetchUrl: fetchUrl.toString(),
  authUrl,
};

export default config;
