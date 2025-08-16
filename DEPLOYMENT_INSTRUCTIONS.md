# Deployment Instructions for iambillboard.com

## Issue Identified:
The deployed website (iambillboard.com) has the old code with login issues, while the fixes are only in this Replit development environment.

## Solution:
Deploy the updated code from this Replit to your production server.

## Quick Fix Commands for Production Server:

1. **Update Admin Password in Production Database:**
```bash
# Connect to production database and update password
psql $DATABASE_URL -c "UPDATE users SET password = '\$2b\$10\$RiIIjUJGxVXeE/dmOuQeX.i0lc1r/f0GpzYZ8xEm4i3i2jRTZT6PW' WHERE username = 'judge';"
```

2. **Build and Deploy Updated Code:**
```bash
# Run this in Replit first
npm run build

# Then copy dist/ folder and all server files to production
# Restart production server with updated code
```

## Files That Need to be Updated on Production:
- `dist/` (entire folder with new build)
- `server/routes.ts` (has the login fixes)
- `server/index.ts` (has CORS fixes)
- `package.json` (if dependencies changed)

## The Working Login Credentials:
- Username: `judge`
- Password: `judge1313`

## Current Status:
✅ Development version (this Replit) - LOGIN WORKS
❌ Production version (iambillboard.com) - OLD CODE, LOGIN FAILS

You need to deploy this updated code to fix the production login.