import { pgTable, text, serial, integer, boolean, timestamp, decimal, index, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"), // Add phone field for users
  role: text("role").default("user").notNull(), // user, admin
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpiry: timestamp("email_verification_expiry"),
  isBanned: boolean("is_banned").default(false),
  banReason: text("ban_reason"),
  bannedAt: timestamp("banned_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id),
  bottleType: text("bottle_type").notNull(),
  quantity: integer("quantity").notNull(),
  designRequirements: text("design_requirements"),
  status: text("status").default("pending").notNull(),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  customerCity: text("customer_city"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  paymentStatus: text("payment_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin management tables
// Email and SMS configuration settings (persisted in database)
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(), // "email_config", "sms_config", etc.
  settingValue: jsonb("setting_value").notNull(), // JSON data for the setting
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"), // User description about their advertisement purpose
  bottleType: text("bottle_type").notNull(), // "750ml", "1L", "500ml", "2L", etc.
  quantity: integer("quantity").notNull(),
  designUrl: text("design_url"),
  selectedDesignId: integer("selected_design_id"), // ID of selected design from gallery
  selectedDesignTitle: text("selected_design_title"), // Title of selected design from gallery
  uploadedDesignFileName: text("uploaded_design_file_name"), // Name of user uploaded design file
  designType: text("design_type"), // "gallery_selected" or "user_uploaded"
  
  // Delivery and Distribution Options
  distributionOption: text("distribution_option"), // "inStores", "atYourLocation", "split"
  selectedCity: text("selected_city"), // City selected by user
  selectedArea: text("selected_area"), // Area selected by user
  selectedState: text("selected_state"), // State selected by user
  deliveryAddress: text("delivery_address"), // Full delivery address if "atYourLocation"
  
  // Split Distribution Details
  storesQuantity: integer("stores_quantity"), // Quantity for stores if split
  homeQuantity: integer("home_quantity"), // Quantity for home delivery if split
  
  // Bottle Selection Mix Details
  bottleSelectionType: text("bottle_selection_type"), // "single", "mixed"
  bottle750mlQty: integer("bottle_750ml_qty"), // 750ml bottle quantity
  bottle1LQty: integer("bottle_1l_qty"), // 1L bottle quantity
  
  // Payment and Pricing Details
  pricePerBottle: decimal("price_per_bottle", { precision: 10, scale: 2 }),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  
  requirements: text("requirements"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  
  // Customer Contact Information
  email: text("email"), // Customer email for notifications
  phone: text("phone"), // Customer phone number
  customerName: text("customer_name"), // Customer full name
  customerPhone: text("customer_phone"), // Additional customer phone field
  businessName: text("business_name"), // Business name if applicable
  selectedOption: text("selected_option"), // Selected option/package
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }), // Total campaign amount
  
  status: text("status").default("pending").notNull(), // pending, approved, rejected, in_production, shipped, delivered
  adminNotes: text("admin_notes"),
  rejectionReason: text("rejection_reason"), // Reason for campaign rejection
  
  // Design reupload system
  designFeedback: text("design_feedback"), // Specific feedback about design issues
  reuploadRequired: boolean("reupload_required").default(false), // Whether design needs to be reuploaded
  designRejectionReason: text("design_rejection_reason"), // Detailed reason for design rejection
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const priceSettings = pgTable("price_settings", {
  id: serial("id").primaryKey(),
  bottleType: text("bottle_type").notNull(), // "750ml", "1L", "500ml", "2L", etc.
  minQuantity: integer("min_quantity").notNull(),
  maxQuantity: integer("max_quantity"),
  pricePerBottle: decimal("price_per_bottle", { precision: 10, scale: 2 }).notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const logoSettings = pgTable("logo_settings", {
  id: serial("id").primaryKey(),
  logoName: text("logo_name").notNull(),
  logoUrl: text("logo_url").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Order tracking campaigns table
export const orderCampaigns = pgTable("order_campaigns", {
  id: serial("id").primaryKey(),
  campaignId: text("campaign_id").notNull(),
  transactionId: text("transaction_id"),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  bottleType: text("bottle_type").notNull(),
  quantity: integer("quantity").notNull(),
  designImageUrl: text("design_image_url"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").default("pending"),
  upiId: text("upi_id"),
  orderSummary: text("order_summary"),
  distributionOption: text("distribution_option"),
  area: text("area"),
  designFile: text("design_file"),
  bottleSelection: text("bottle_selection"),
  status: text("status").notNull().default("pending_approval"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  notes: text("notes"),
  approvedAt: timestamp("approved_at"),
  productionStartedAt: timestamp("production_started_at"),
  dispatchedAt: timestamp("dispatched_at"),
  completedAt: timestamp("completed_at"),
});

// Home page images table
export const homeImages = pgTable("home_images", {
  id: serial("id").primaryKey(),
  imageName: text("image_name").notNull(),
  imageUrl: text("image_url").notNull(),
  imageType: text("image_type").notNull(), // "hero_bg", "bottle_sample", "feature_icon", etc.
  isActive: boolean("is_active").default(true).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Bottle samples table for water bottle uploads  
export const bottleSamples = pgTable("bottle_samples", {
  id: serial("id").primaryKey(),
  bottleType: text("bottle_type").notNull(), // '750ml', '1L', '500ml', '2L', etc.
  imageName: text("image_name").notNull(),
  imageUrl: text("image_url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Design samples table for promotion showcases
export const designSamples = pgTable("design_samples", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // "business", "event", "personal", "brand"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User activity logs
export const userActivityLogs = pgTable("user_activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // login, signup, order_placed, profile_updated, etc.
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User profiles
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  company: text("company"),
  dateOfBirth: timestamp("date_of_birth"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Email verification OTPs  
export const emailVerifications = pgTable("email_verifications", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  otp: text("otp").notNull(),
  isUsed: boolean("is_used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Phone OTPs for signup and order verification
export const phoneOtps = pgTable("phone_otps", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  otp: text("otp").notNull(),
  purpose: text("purpose").notNull(), // "signup" or "order_verification"
  isUsed: boolean("is_used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Password reset OTP table
export const passwordResetOtps = pgTable("password_reset_otps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payment accounts for admin
export const paymentAccounts = pgTable("payment_accounts", {
  id: serial("id").primaryKey(),
  accountType: text("account_type").notNull(), // "bank", "upi", "wallet", "card"
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number"),
  ifscCode: text("ifsc_code"),
  upiId: text("upi_id"),
  walletNumber: text("wallet_number"),
  cardNumber: text("card_number"),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transaction tracking
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionRef: text("transaction_ref").unique(),
  orderId: text("order_id"),
  paymentAccountId: integer("payment_account_id").references(() => paymentAccounts.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("INR"),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").default("pending"), // pending, completed, failed, refunded
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed, refunded
  transactionId: text("transaction_id"),
  upiTransactionId: text("upi_transaction_id"),
  gatewayTransactionId: text("gateway_transaction_id"),
  upiId: text("upi_id"),
  cardLastFour: text("card_last_four"),
  gatewayResponse: text("gateway_response"),
  failureReason: text("failure_reason"),
  orderData: text("order_data"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Payment settings
export const paymentSettings = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payment Gateway Configuration
export const paymentGatewaySettings = pgTable("payment_gateway_settings", {
  id: serial("id").primaryKey(),
  gateway: text("gateway").notNull(), // 'razorpay', 'payu', 'stripe'
  isActive: boolean("is_active").default(false),
  keyId: text("key_id"), // Public key / Key ID
  keySecret: text("key_secret"), // Secret key (encrypted)
  webhookSecret: text("webhook_secret"), // Webhook secret for verification
  configuration: jsonb("configuration"), // Additional gateway-specific config
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Testimonials
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerCompany: text("customer_company"),
  rating: integer("rating").notNull(), // 1-5 stars
  testimonialText: text("testimonial_text").notNull(),
  customerImage: text("customer_image"),
  isApproved: boolean("is_approved").default(false),
  isFeatured: boolean("is_featured").default(false),
  orderId: text("order_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
});

// Inventory tracking
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  bottleType: text("bottle_type").notNull(), // "750ml", "1L", etc.
  currentStock: integer("current_stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(100),
  maxStock: integer("max_stock").notNull().default(10000),
  reorderLevel: integer("reorder_level").notNull().default(500),
  supplierName: text("supplier_name"),
  supplierContact: text("supplier_contact"),
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }),
  lastRestocked: timestamp("last_restocked"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Support tickets
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  ticketNumber: text("ticket_number").notNull().unique(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  priority: text("priority").default("medium"), // low, medium, high, urgent
  status: text("status").default("open"), // open, in_progress, resolved, closed
  assignedTo: text("assigned_to"),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  orderId: text("order_id"),
  attachments: text("attachments"), // JSON array of file URLs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // order_update, payment_received, promotion, system
  isRead: boolean("is_read").default(false),
  actionUrl: text("action_url"),
  priority: text("priority").default("normal"), // low, normal, high
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  campaigns: many(campaigns),
  activityLogs: many(userActivityLogs),
  supportTickets: many(supportTickets),
  notifications: many(notifications),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one }) => ({
  user: one(users, {
    fields: [campaigns.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  paymentAccount: one(paymentAccounts, {
    fields: [transactions.paymentAccountId],
    references: [paymentAccounts.id],
  }),
}));

export const userActivityLogsRelations = relations(userActivityLogs, ({ one }) => ({
  user: one(users, {
    fields: [userActivityLogs.userId],
    references: [users.id],
  }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  contact: one(contacts, {
    fields: [orders.contactId],
    references: [contacts.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;
export type PriceSetting = typeof priceSettings.$inferSelect;
export type InsertPriceSetting = typeof priceSettings.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;
export type OrderCampaign = typeof orderCampaigns.$inferSelect;
export type InsertOrderCampaign = typeof orderCampaigns.$inferInsert;
export type HomeImage = typeof homeImages.$inferSelect;
export type InsertHomeImage = typeof homeImages.$inferInsert;
export type BottleSample = typeof bottleSamples.$inferSelect;
export type InsertBottleSample = typeof bottleSamples.$inferInsert;
export type DesignSample = typeof designSamples.$inferSelect;
export type InsertDesignSample = typeof designSamples.$inferInsert;
export type UserActivityLog = typeof userActivityLogs.$inferSelect;
export type InsertUserActivityLog = typeof userActivityLogs.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type EmailVerification = typeof emailVerifications.$inferSelect;
export type InsertEmailVerification = typeof emailVerifications.$inferInsert;
export type PhoneOtp = typeof phoneOtps.$inferSelect;
export type InsertPhoneOtp = typeof phoneOtps.$inferInsert;
export type PasswordResetOtp = typeof passwordResetOtps.$inferSelect;
export type InsertPasswordResetOtp = typeof passwordResetOtps.$inferInsert;
export type PaymentAccount = typeof paymentAccounts.$inferSelect;
export type InsertPaymentAccount = typeof paymentAccounts.$inferInsert;
export type PaymentGatewaySetting = typeof paymentGatewaySettings.$inferSelect;
export type InsertPaymentGatewaySetting = typeof paymentGatewaySettings.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type PaymentSetting = typeof paymentSettings.$inferSelect;
export type InsertPaymentSetting = typeof paymentSettings.$inferInsert;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Site Visitors Tracking Table
export const siteVisitors = pgTable("site_visitors", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  pageUrl: text("page_url"),
  referrer: text("referrer"),
  userId: integer("user_id").references(() => users.id), // null if visitor not logged in
  visitedAt: timestamp("visited_at").defaultNow().notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true), // false if visitor left site
});

export type InsertSiteVisitor = typeof siteVisitors.$inferInsert;
export type SiteVisitor = typeof siteVisitors.$inferSelect;

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPriceSettingSchema = createInsertSchema(priceSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });
export const insertOrderCampaignSchema = createInsertSchema(orderCampaigns).omit({ 
  id: true, 
  submittedAt: true, 
  reviewedAt: true, 
  approvedAt: true, 
  productionStartedAt: true, 
  dispatchedAt: true, 
  completedAt: true 
});
export const insertHomeImageSchema = createInsertSchema(homeImages).omit({ id: true, uploadedAt: true });
export const insertBottleSampleSchema = createInsertSchema(bottleSamples).omit({ id: true, uploadedAt: true });
export const insertDesignSampleSchema = createInsertSchema(designSamples).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserActivityLogSchema = createInsertSchema(userActivityLogs).omit({ id: true, createdAt: true });
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmailVerificationSchema = createInsertSchema(emailVerifications).omit({ id: true, createdAt: true });
export const insertPaymentAccountSchema = createInsertSchema(paymentAccounts).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, completedAt: true });
export const insertPaymentSettingSchema = createInsertSchema(paymentSettings).omit({ id: true, updatedAt: true });
export const insertPaymentGatewaySettingSchema = createInsertSchema(paymentGatewaySettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true, createdAt: true, approvedAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, updatedAt: true, lastRestocked: true });
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, updatedAt: true, resolvedAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, readAt: true });

export const insertLogoSettingSchema = createInsertSchema(logoSettings).omit({ id: true, uploadedAt: true });
export type LogoSetting = typeof logoSettings.$inferSelect;
export type InsertLogoSetting = z.infer<typeof insertLogoSettingSchema>;