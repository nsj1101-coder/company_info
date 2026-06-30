import axios from 'axios';

// 빌드 base 에 맞춰 API 경로 결정. '/couple/' → '/couple/api', '/' → '/api'
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
// 백엔드 응답은 { success, data } 래핑됨.
const api = axios.create({ baseURL: `${base}/api` });

api.interceptors.response.use(
  (res) => res.data?.data ?? res.data,
  (err) => Promise.reject(err),
);

export default api;
