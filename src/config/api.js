const DEFAULT_LOCAL_API_URL = 'http://localhost:5000';
const DEFAULT_PROD_API_URL = 'https://collab-tool-oenr.onrender.com';

const stripTrailingSlash = (url = '') => url.replace(/\/+$/, '');

const resolveApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    const envUrl = stripTrailingSlash((process.env.REACT_APP_API_URL || '').trim());

    if (envUrl) {
      const isEnvLocal =
        envUrl.includes('localhost') || envUrl.includes('127.0.0.1');

      // Prevent deployed frontend builds from accidentally calling localhost.
      if (!isLocalHost && isEnvLocal) {
        return DEFAULT_PROD_API_URL;
      }
      return envUrl;
    }

    return isLocalHost ? DEFAULT_LOCAL_API_URL : DEFAULT_PROD_API_URL;
  }

  const envUrl = (process.env.REACT_APP_API_URL || '').trim();
  if (envUrl) return stripTrailingSlash(envUrl);

  return DEFAULT_PROD_API_URL;
};

export const API_BASE_URL = resolveApiBaseUrl();
