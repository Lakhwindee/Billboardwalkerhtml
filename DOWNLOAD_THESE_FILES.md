# Files to Download and Upload to Production

## From this Replit, download these folders:

1. **dist/** - Complete production build with all fixes
2. **server/** - Backend code with login fixes

## Upload to your DigitalOcean server:

Replace these folders on your production server:
- `/path/to/your/app/dist/` ← upload dist/ here
- `/path/to/your/app/server/` ← upload server/ here

## Alternative: Direct server commands

If you have server access, run this on your production server:

```bash
# Download files directly to server
wget [Replit-download-link-for-dist.tar.gz]
wget [Replit-download-link-for-server.tar.gz]

# Extract and replace
tar -xzf dist.tar.gz
tar -xzf server.tar.gz

# Update database password
psql $DATABASE_URL -c "UPDATE users SET password = '\$2b\$10\$RiIIjUJGxVXeE/dmOuQeX.i0lc1r/f0GpzYZ8xEm4i3i2jRTZT6PW' WHERE username = 'judge';"

# Restart app
pm2 restart iambillboard
```

The login will work on iambillboard.com after this deployment.