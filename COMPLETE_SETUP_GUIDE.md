# IamBillBoard - Complete Setup Guide for New Agents

## 📋 Project Overview
Professional bottle manufacturing/ordering system website for Chandigarh, Panchkula, and Mohali areas. 
This package contains the EXACT same website with all features working.

## 🚀 Quick Setup Commands
```bash
# 1. Extract files
tar -xzf iambillboard-complete-package.tar.gz
cd iambillboard-website

# 2. Install dependencies  
npm install

# 3. Set environment variables
export DATABASE_URL="your_database_url"
export SESSION_SECRET="your_session_secret"

# 4. Start development server
npm run dev
```

## 🔧 Key Features Included
✅ **Authentication System**: Session-based auth with admin access
✅ **Campaign Management**: Create, approve, manage bottle campaigns  
✅ **File Upload System**: A3 size validation (15MB limit)
✅ **Admin Panel**: Complete admin interface at /admin
✅ **Mobile Responsive**: Perfect mobile design
✅ **Database Integration**: PostgreSQL with Drizzle ORM
✅ **Real-time Features**: Visitor tracking, real API data

## 📁 Project Structure
```
├── client/          # React frontend
├── server/          # Express backend  
├── shared/          # Shared schemas
├── uploads/         # File upload directories
├── package.json     # Dependencies
├── ecosystem.production.cjs  # PM2 config
└── production-server.js      # Production server
```

## 🔐 Admin Access
- URL: `/admin`
- Username: `judge`
- Password: `judge1313`

## 🌐 Production Deployment
Use ecosystem.production.cjs for PM2 deployment:
```bash
pm2 start ecosystem.production.cjs
```

## 📝 Important Notes
- This is the EXACT same website - no design changes needed
- All features are production-ready and tested
- A3 validation system is implemented and working
- Mobile responsive design is complete
- Database schema is included and ready

## 🆘 Support
All files are production-ready. Just follow setup commands above for exact same website.