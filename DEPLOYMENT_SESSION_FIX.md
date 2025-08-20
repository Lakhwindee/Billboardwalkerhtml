# Deployment Session Issue Fix

## Problem Summary
After deployment, admin credentials (judge/judge1313) are incorrectly showing campaign manager interface instead of admin panel. This happens only in deployment environment, not in Replit preview.

## Root Cause
Session contamination and persistence issues in deployment environment where previous session data from campaign manager login is being cached/mixed with admin login.

## Solution Implemented

### 1. Session Configuration Enhancement
- Added custom session name `iambb.sid` for deployment identification
- Enhanced cookie domain handling for production environment
- Improved session security settings

### 2. Login Process Enhancement
- Added `req.session.regenerate()` to create fresh session on every login
- Prevents session contamination between different user roles
- Ensures clean session state for each login

### 3. Logout Process Enhancement
- Clear multiple cookie variations (`connect.sid`, `iambb.sid`)
- Clear cookies with different path and domain options
- Frontend clears localStorage and sessionStorage
- Uses `window.location.replace()` for complete page refresh

### 4. Debug Endpoint Added
- Admin-only endpoint `/api/clear-sessions` to clear all sessions from database
- Useful for deployment troubleshooting

## Testing Steps for Deployment

1. **Deploy the updated code**
2. **Clear all sessions**: Admin login → call `/api/clear-sessions`
3. **Test admin login**: Use judge/judge1313 → should show Admin Panel
4. **Test campaign manager login**: Use campaign/campaign123 → should show Campaign Manager
5. **Test logout**: Verify complete session clearing

## Key Changes Made

### Backend (server/routes.ts)
- Session regeneration on login
- Enhanced cookie clearing on logout
- Custom session name and domain handling
- Debug endpoint for session clearing

### Frontend (client/src/pages/admin.tsx)
- Enhanced logout with storage clearing
- Complete page refresh to prevent caching

## Deployment Recommendation
After deploying these changes, clear all existing sessions using the debug endpoint to ensure clean slate for all users.

## Contact Messages Access
Also fixed: Campaign managers now have full access to Contact Messages tab content (was previously restricted to admin only).