const DEFAULT_LOCAL_API_URL = 'http://localhost:5000';
const DEFAULT_PROD_API_URL = 'https://collab-tool-oenr.onrender.com';

const stripTrailingSlash = (url = '') => url.replace(/\/+$/, '');

const resolveApiBaseUrl = () => {
  const envUrl = (process.env.REACT_APP_API_URL || '').trim();
  if (envUrl) return stripTrailingSlash(envUrl);

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    return isLocalHost ? DEFAULT_LOCAL_API_URL : DEFAULT_PROD_API_URL;
  }

  return DEFAULT_PROD_API_URL;
};

export const API_BASE_URL = resolveApiBaseUrl();
