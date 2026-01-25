const DEFAULT_BACKEND_URL = 'http://localhost:8000';

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || DEFAULT_BACKEND_URL;
export const API_BASE_URL = `${BACKEND_URL}/api`;
