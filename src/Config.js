const DEV = process.env.NODE_ENV === 'development';

const DEV_SSL = process.env.REACT_APP_DEV_SSL === 'true';

const applicationId = '0b33e830-7cde-4b90-ad7e-2a39c57c0e11';

const sandboxId = '0b33e830-7cde-4b90-ad7e-2a39c57c0e11';

const baseUrl = new URL('https://serve.onegraph.com');

if (DEV) {
  if (!DEV_SSL) {
    baseUrl.protocol = 'http:'
  }
  baseUrl.hostname = 'serve.onegraph.dev';
  baseUrl.port = 8082;
}

const fetchUrl = new URL(baseUrl.toString());
fetchUrl.pathname = '/dynamic';
fetchUrl.searchParams.append('application_id', applicationId);

function authUrl(service) {
  const url = new URL(baseUrl.toString());
  url.pathname = '/oauth/start';
  url.searchParams.append('service', service);
  url.searchParams.append('app_id', sandboxId);
  url.searchParams.append('redirect_origin', window.location.origin);
  return url.toString();
}

const config = {
  isDev: DEV,
  applicationId,
  oneGraphOrigin: baseUrl.toString(),
  fetchUrl: fetchUrl.toString(),
  authUrl,
};

export default config;
