import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// maximpact.co.kr/couple 서브패스 배포 기준
export default defineConfig({
  base: '/couple/',
  plugins: [react()],
  // 상위 레포의 PostCSS(tailwind) 설정 자동 탐색 차단
  css: { postcss: {} },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    proxy: {
      '/couple/api': {
        target: 'http://127.0.0.1:4500',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/couple/, ''),
      },
    },
  },
});
