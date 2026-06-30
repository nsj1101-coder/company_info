// PM2 배포 설정 — 서버에서 `pm2 start ecosystem.config.cjs`
module.exports = {
  apps: [
    {
      name: 'couple-api',
      cwd: '/opt/couple-app/backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: '4500',
        DB_HOST: '127.0.0.1',
        DB_PORT: '3306',
        DB_USER: 'couple',
        DB_NAME: 'couple',
        DB_SYNC: 'true',
        // DB_PASS 는 서버에서 pm2 start 시점에 주입(여기엔 평문 비번 미기재)
      },
    },
  ],
};
