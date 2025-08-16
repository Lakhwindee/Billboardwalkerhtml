# 🚀 Replit Import Guide - Complete Website

## Step 1: Import Project to Replit

### Method 1: Direct Upload
1. Replit में new repl create करें
2. "Upload folder" option use करें
3. यह complete `iambillboard-complete-website` folder upload करें

### Method 2: From ZIP
1. इस folder को ZIP करें
2. Replit में "Import from ZIP" use करें
3. ZIP file upload करें

## Step 2: Replit Setup

### Dependencies Install
```bash
npm install
```

### Environment Variables (Replit Secrets)
Replit के Secrets tab में add करें:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Random secure string for sessions

### Optional Secrets (Production के लिए)
- `EMAIL_USER`: Gmail username for notifications
- `EMAIL_PASSWORD`: Gmail app password
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token

## Step 3: Database Setup

### PostgreSQL Database
1. Replit के Database tab use करें या
2. External PostgreSQL provider (Neon, Supabase) use करें
3. Connection string को `DATABASE_URL` में add करें

### Schema Push
```bash
npm run db:push
```

## Step 4: Start Development

### Run Command
```bash
npm run dev
```

### Website Access
- Homepage: `https://your-repl-name.replit.dev`
- Admin Panel: `https://your-repl-name.replit.dev/admin`

## Step 5: Verification

### Test Features
✅ Homepage loading with bottle content
✅ Campaign creation working
✅ File upload with A3 validation
✅ Admin login (judge/judge1313)
✅ Mobile responsive design
✅ Database connectivity

### Admin Panel Test
1. Visit `/admin`
2. Login with `judge/judge1313`
3. Check all tabs working:
   - Dashboard
   - Campaigns
   - Users
   - Pricing
   - Content
   - Design Samples

## 🎯 Production Deployment

### Replit Deployments
1. Replit के Deployments tab में जाएं
2. "Deploy" button click करें
3. Custom domain set करें (optional)

### Manual Server Deployment
```bash
pm2 start ecosystem.production.cjs
```

## ⚠️ Troubleshooting

### Common Issues
1. **Dependencies Error**: Run `npm install` again
2. **Database Error**: Check `DATABASE_URL` in secrets
3. **Port Error**: Replit automatically handles ports
4. **File Upload Error**: Check `uploads/` folder permissions

### Debug Commands
```bash
# Check logs
npm run dev

# Database connection test
npm run db:push

# File permissions
ls -la uploads/
```

## 🔧 File Structure Verification
```
├── client/src/          # React components
├── server/routes.ts     # API endpoints
├── shared/schema.ts     # Database schema
├── uploads/             # File storage
├── package.json         # Dependencies
└── production files     # PM2 config
```

## ✅ Success Indicators
- Repl runs without errors
- Homepage shows "Custom Bottle Advertising Revolution"
- Admin panel accessible at `/admin`
- File uploads working with size validation
- Database queries successful
- Mobile responsive layout working

## 🆘 Support Notes
- All files are production-ready
- No code changes needed
- Just follow setup steps exactly
- Website will be identical to original

**RESULT: Exact same website working on Replit!**