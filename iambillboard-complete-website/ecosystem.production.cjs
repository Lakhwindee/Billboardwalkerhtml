module.exports = {
  apps: [{
    name: 'iambillboard-api',
    script: 'node',
    args: 'production-server.js',
    cwd: '/var/www/html/Billboardwalkerhtml',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://dbu2265491:Judge_1313@db5018416097.hosting-data.io:5432/dbs13774674',
      SESSION_SECRET: 'iambillboard-production-secret-2025-digitalocean'
    },
    log_file: '/var/log/pm2/iambillboard.log',
    out_file: '/var/log/pm2/iambillboard.out.log',
    error_file: '/var/log/pm2/iambillboard.error.log',
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}