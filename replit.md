# IamBillBoard - Custom Bottle Advertising Platform

## Overview
IamBillBoard is a full-stack web application for custom bottle advertising, primarily for the Indian market. It allows users to design custom bottle labels, get real-time price estimations, and manage orders. Key capabilities include a comprehensive user dashboard, administrative tools for content and campaign management, and robust user and payment systems. The project aims to provide a seamless and professional experience for custom bottle branding, leveraging modern web technologies for scalability and user-friendliness. The business vision is to capture a significant share of the custom branding market in India, starting with Chandigarh, Panchkula, and Mohali, by offering a unique and efficient online platform.

## User Preferences
Preferred communication style: Simple, everyday language.
Target deployment: DigitalOcean hosting with full Node.js backend support.
Requirements: Clean essential files only, working authentication system, admin panel access.
Zero tolerance for unused/backup files - user demands "exdum clean files chahiye".

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, Vite build tool.
- **Routing**: Wouter.
- **State Management**: TanStack Query (React Query).
- **Styling**: Tailwind CSS with custom CSS variables; shadcn/ui components (built on Radix UI).
- **Design System**: Dark theme with red/pink/purple gradient accents, vibrant and colorful design.
- **Key Features**: Responsive design, interactive dashboard with real-time price calculator, 3D bottle preview (1L bottle focus), image cropping, 360° rotation, file upload, form handling with React Hook Form and Zod validation, comprehensive billing system.
- **Content Management**: Homepage content (hero section, stats, bottle section titles, page title, meta descriptions) is editable via the admin panel GUI.
- **Geographical Focus**: Services targeted to Chandigarh, Panchkula, and Mohali regions, with Indian state and city data and cascading dropdowns.
- **Validation**: A3 paper size validation (15MB) for user design uploads, including Hindi error messages.

### Backend
- **Framework**: Express.js with TypeScript, Node.js runtime (ESM modules).
- **API Design**: RESTful API structure (/api prefix).
- **Error Handling**: Centralized middleware.
- **Session Management**: PostgreSQL session store with connect-pg-simple.
- **Core Functionality**: User authentication and authorization (role-based access for 'judge' admin and 'campaign manager'), campaign management (admin approval/decline), dynamic price management, contact form submissions, automated email and SMS notification workflows, payment account/transaction management, real-time visitor tracking.

### Data Storage
- **Primary Database**: PostgreSQL (Replit PostgreSQL Database).
- **ORM**: Drizzle ORM with schema-first approach and Drizzle Kit for migrations.
- **Schema**: Users, campaigns, price settings, site settings, user profiles, user activity logs, payment accounts, transactions, site visitors.
- **Session Storage**: PostgreSQL-based.

### Admin Panel
- **Access**: Restricted to 'judge' account (judge/judge1313 credentials). 'Campaign manager' role (campaign/campaign123) has access to campaigns and contact messages tabs.
- **Features**: Campaign approval, dynamic price management, contact management, user management (ban/unban, activity logs), website content editing (homepage GUI editor), bottle samples management (upload, live preview), payment account/transaction management, and visitor analytics.
- **Authentication**: Secure session-based authentication with protected API routes and multi-step signup verification (email and phone OTP).
- **Navigation**: Desktop interface includes Dashboard and Home buttons (admin only), and Sign Out button (all users). Mobile interface shows Home icon (admin only) and Sign Out icon (all users). Campaign managers have access to Campaigns and Contact Messages tabs.
- **In-stores Delivery**: Enhanced address input system for in-stores delivery with PIN code and contact phone validation.

## External Dependencies

### Database & Hosting
- **Neon Database**: (Previously used for serverless PostgreSQL hosting, now migrated to Replit PostgreSQL).

### UI/UX Libraries & Tools
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first styling framework.
- **Lucide React**: Icon library.
- **React Hook Form**: Form state management and validation.
- **Zod**: Schema validation.
- **react-dropzone**: File upload component.

### Payment & Communication
- **Nodemailer**: For automated email notifications (campaign confirmations, status updates) with support for Gmail, Ionos, and custom SMTP.
- **Twilio SMS**: For instant SMS notifications (welcome messages, payment confirmations, status updates) with Indian phone number support.
- **Payment Gateways**: Integrated for Card Payment (Visa/MasterCard/RuPay), UPI Payment (PhonePe/Google Pay/Paytm), and Apple Pay.