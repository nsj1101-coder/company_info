import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';

// 빌드 시 vite base(--base)에 맞춰 자동 결정. '/couple/' → '/couple', '/' → '/'
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <AppRouter />
    </BrowserRouter>
  );
}
