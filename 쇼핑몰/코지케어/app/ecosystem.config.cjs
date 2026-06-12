module.exports = {
  apps: [
    {
      name: "cozycare-web",
      script: ".next/standalone/server.js",
      cwd: "/opt/cozycare-app",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 4100,
        HOSTNAME: "127.0.0.1",
        DATABASE_URL: "file:./dev.db",
        JWT_SECRET: "cozycare-prod-secret-change-me",
      },
    },
  ],
};
