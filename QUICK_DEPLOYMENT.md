# IMMEDIATE FIX FOR PRODUCTION

## Problem: 
iambillboard.com has old broken code. This Replit has working code.

## Solution:
Replace production server files with these working files.

## Files to upload to your DigitalOcean server:

1. **dist/** folder (production build)
2. **server/** folder (all backend files)  
3. **package.json**

## Quick Commands for your server:

```bash
# 1. Stop current server
pm2 stop iambillboard

# 2. Update admin password in production database
psql $DATABASE_URL -c "UPDATE users SET password = '\$2b\$10\$RiIIjUJGxVXeE/dmOuQeX.i0lc1r/f0GpzYZ8xEm4i3i2jRTZT6PW' WHERE username = 'judge';"

# 3. Start server with new code
pm2 start dist/index.js --name iambillboard
```

## Login will work with:
- Username: judge
- Password: judge1313