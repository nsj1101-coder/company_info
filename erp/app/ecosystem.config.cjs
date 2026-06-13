module.exports = {
  apps: [
    {
      name: "lalune-erp",
      script: "server.js",
      cwd: "/opt/lalune-erp",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 4300,
        HOSTNAME: "127.0.0.1",
        DATABASE_URL: "file:/opt/lalune-erp/dev.db",
        JWT_SECRET: "lalune-erp-prod-secret-2026",
        NEXT_PUBLIC_BASE_PATH: "/lalune-erp",
      },
    },
  ],
};
