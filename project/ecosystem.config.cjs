module.exports = {
  apps: [
    {
      name: "cabinet-reverb",
      cwd: __dirname,
      script: "artisan",
      args: "reverb:start --host=0.0.0.0 --port=8080",
      interpreter: "php",
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 3000,
      env: {
        APP_ENV: "local"
      }
    },
    {
      name: "cabinet-queue-worker",
      cwd: __dirname,
      script: "artisan",
      args: "queue:work --sleep=1 --tries=3 --timeout=120",
      interpreter: "php",
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 3000,
      env: {
        APP_ENV: "local"
      }
    },
    {
      name: "cabinet-whatsapp",
      cwd: "./services/whatsapp",
      script: "src/index.js",
      node_args: "--env-file=.env"
    }
  ]
};
