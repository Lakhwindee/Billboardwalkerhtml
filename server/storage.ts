import { 
  users, contacts, orders, campaigns, priceSettings, siteSettings, homeImages, bottleSamples, designSamples,
  userActivityLogs, userProfiles, orderCampaigns, emailVerifications, phoneOtps, passwordResetOtps, paymentAccounts, transactions, paymentSettings, paymentGatewaySettings, logoSettings, sessions, siteVisitors,
  type User, type InsertUser, 
  type Contact, type InsertContact, 
  type Order, type InsertOrder,
  type Campaign, type InsertCampaign,
  type PriceSetting, type InsertPriceSetting,
  type SiteSetting, type InsertSiteSetting,
  type HomeImage, type InsertHomeImage,
  type BottleSample, type InsertBottleSample,
  type DesignSample, type InsertDesignSample,
  type UserActivityLog, type InsertUserActivityLog,
  type UserProfile, type InsertUserProfile,
  type OrderCampaign, type InsertOrderCampaign,
  type PhoneOtp, type InsertPhoneOtp,
  type PasswordResetOtp, type InsertPasswordResetOtp,
  type PaymentAccount, type InsertPaymentAccount,
  type Transaction, type InsertTransaction,
  type PaymentSetting, type InsertPaymentSetting,
  type PaymentGatewaySetting, type InsertPaymentGatewaySetting,
  type LogoSetting, type InsertLogoSetting,
  type SiteVisitor, type InsertSiteVisitor
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Authentication methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(user: User, password: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  createUserActivityLog(log: InsertUserActivityLog): Promise<UserActivityLog>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(): Promise<Order[]>;
  getOrdersByContactId(contactId: number): Promise<Order[]>;
  
  // Campaign management
  getCampaigns(): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign>;
  
  // Price settings
  getPriceSettings(): Promise<PriceSetting[]>;
  createPriceSetting(priceSetting: InsertPriceSetting): Promise<PriceSetting>;
  updatePriceSetting(id: number, updates: Partial<PriceSetting>): Promise<PriceSetting>;
  
  // Site settings
  getSiteSettings(): Promise<SiteSetting[]>;
  createSiteSetting(siteSetting: InsertSiteSetting): Promise<SiteSetting>;
  updateSiteSetting(id: number, updates: Partial<SiteSetting>): Promise<SiteSetting>;
  
  // Home images
  getHomeImages(): Promise<HomeImage[]>;
  createHomeImage(homeImage: InsertHomeImage): Promise<HomeImage>;
  updateHomeImage(id: number, updates: Partial<HomeImage>): Promise<HomeImage>;
  deleteHomeImage(id: number): Promise<void>;
  
  // Bottle samples
  getBottleSamples(): Promise<BottleSample[]>;
  getBottleSamplesByType(bottleType: string): Promise<BottleSample[]>;
  createBottleSample(bottleSample: InsertBottleSample): Promise<BottleSample>;
  updateBottleSample(id: number, updates: Partial<BottleSample>): Promise<BottleSample>;
  deleteBottleSample(id: number): Promise<void>;
  
  // Design samples
  getDesignSamples(): Promise<DesignSample[]>;
  getDesignSamplesByCategory(category: string): Promise<DesignSample[]>;
  createDesignSample(designSample: InsertDesignSample): Promise<DesignSample>;
  updateDesignSample(id: number, updates: Partial<DesignSample>): Promise<DesignSample>;
  deleteDesignSample(id: number): Promise<void>;
  
  // User management
  getUsers(): Promise<User[]>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  deleteUser(id: number): Promise<void>;
  getUserProfiles(): Promise<UserProfile[]>;
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(userProfile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(id: number, updates: Partial<UserProfile>): Promise<UserProfile>;
  deleteUserProfile(userId: number): Promise<void>;
  
  // Activity logs
  getUserActivityLogs(): Promise<UserActivityLog[]>;
  getUserActivityLogsByUserId(userId: number): Promise<UserActivityLog[]>;
  createUserActivityLog(activityLog: InsertUserActivityLog): Promise<UserActivityLog>;
  deleteUserActivityLogs(userId: number): Promise<void>;

  // Order campaigns
  getOrderCampaigns(): Promise<OrderCampaign[]>;
  getUserCampaigns(email: string): Promise<OrderCampaign[]>;
  createOrderCampaign(orderCampaign: InsertOrderCampaign): Promise<OrderCampaign>;
  updateOrderCampaign(id: number, updates: Partial<OrderCampaign>): Promise<OrderCampaign>;
  

  
  // Email verification
  createEmailVerification(verification: { email: string; otp: string; expiresAt: Date }): Promise<any>;
  getEmailVerification(email: string, otp: string): Promise<any>;
  getLatestVerification(email: string): Promise<any>;
  markOTPAsUsed(id: number): Promise<void>;
  
  // Phone OTP verification
  createPhoneOTP(phoneOtp: InsertPhoneOtp): Promise<PhoneOtp>;
  getPhoneOTP(phone: string, otp: string, purpose: string): Promise<PhoneOtp | undefined>;
  markPhoneOTPAsUsed(id: number): Promise<void>;
  updateOrderCampaignStatus(id: number, updates: any): Promise<OrderCampaign>;

  // Payment Management
  getPaymentAccounts(): Promise<PaymentAccount[]>;
  createPaymentAccount(paymentAccount: InsertPaymentAccount): Promise<PaymentAccount>;
  updatePaymentAccount(id: number, updates: Partial<PaymentAccount>): Promise<PaymentAccount>;
  deletePaymentAccount(id: number): Promise<void>;
  setDefaultPaymentAccount(id: number): Promise<void>;
  
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  getTransactionByRef(transactionRef: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction>;
  updateTransactionByRef(transactionRef: string, updates: Partial<Transaction>): Promise<Transaction>;
  
  getPaymentSettings(): Promise<PaymentSetting[]>;
  createPaymentSetting(paymentSetting: InsertPaymentSetting): Promise<PaymentSetting>;
  updatePaymentSetting(id: number, updates: Partial<PaymentSetting>): Promise<PaymentSetting>;
  deletePaymentSetting(id: number): Promise<void>;

  // Payment Gateway Configuration
  getPaymentGatewaySettings(): Promise<PaymentGatewaySetting[]>;
  getActivePaymentGateway(): Promise<PaymentGatewaySetting | undefined>;
  createPaymentGatewaySetting(gatewaySetting: InsertPaymentGatewaySetting): Promise<PaymentGatewaySetting>;
  updatePaymentGatewaySetting(id: number, updates: Partial<PaymentGatewaySetting>): Promise<PaymentGatewaySetting>;
  setActivePaymentGateway(gateway: string): Promise<void>;
  
  // Logo management
  getLogoSettings(): Promise<LogoSetting[]>;
  createLogoSetting(logoSetting: InsertLogoSetting): Promise<LogoSetting>;
  updateLogoSetting(id: number, updates: Partial<LogoSetting>): Promise<LogoSetting>;
  deleteLogoSetting(id: number): Promise<void>;
  setActiveLogo(id: number): Promise<void>;
  getActiveLogo(): Promise<LogoSetting | undefined>;
  
  // Password reset methods
  createPasswordResetOtp(resetOtp: InsertPasswordResetOtp): Promise<PasswordResetOtp>;
  verifyPasswordResetOtp(userId: number, otp: string): Promise<boolean>;
  markPasswordResetOtpsAsUsed(userId: number): Promise<void>;
  
  // Site visitor tracking methods
  createSiteVisitor(visitor: InsertSiteVisitor): Promise<SiteVisitor>;
  updateSiteVisitorActivity(sessionId: string): Promise<void>;
  markVisitorInactive(sessionId: string): Promise<void>;
  getActiveSiteVisitors(): Promise<SiteVisitor[]>;
  getSiteVisitorStats(): Promise<{
    totalActiveVisitors: number;
    totalVisitorsToday: number;
    totalVisitorsThisWeek: number;
    totalVisitorsThisMonth: number;
  }>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUserActivityLog(log: InsertUserActivityLog): Promise<UserActivityLog> {
    const [newLog] = await db.insert(userActivityLogs).values(log).returning();
    return newLog;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db.insert(userProfiles).values(profile).returning();
    return newProfile;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await this.hashPassword(insertUser.password);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrdersByContactId(contactId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.contactId, contactId));
  }

  // Campaign management methods
  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db
      .insert(campaigns)
      .values(insertCampaign)
      .returning();
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  // Design reupload methods
  async requestDesignReupload(campaignId: number, feedback: string, rejectionReason: string): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({ 
        reuploadRequired: true,
        designFeedback: feedback,
        designRejectionReason: rejectionReason,
        status: 'design_feedback',
        updatedAt: new Date()
      })
      .where(eq(campaigns.id, campaignId))
      .returning();
    return campaign;
  }

  async submitReuploadedDesign(campaignId: number, designUrl: string, fileName: string): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({
        designUrl: designUrl,
        uploadedDesignFileName: fileName,
        reuploadRequired: false,
        status: 'pending', // Back to pending for admin review
        updatedAt: new Date()
      })
      .where(eq(campaigns.id, campaignId))
      .returning();
    return campaign;
  }

  // Price settings methods
  async getPriceSettings(): Promise<PriceSetting[]> {
    return await db.select().from(priceSettings);
  }

  async createPriceSetting(insertPriceSetting: InsertPriceSetting): Promise<PriceSetting> {
    const [priceSetting] = await db
      .insert(priceSettings)
      .values(insertPriceSetting)
      .returning();
    return priceSetting;
  }

  async updatePriceSetting(id: number, updates: Partial<PriceSetting>): Promise<PriceSetting> {
    const [priceSetting] = await db
      .update(priceSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(priceSettings.id, id))
      .returning();
    return priceSetting;
  }

  async deletePriceSetting(id: number): Promise<void> {
    await db.delete(priceSettings).where(eq(priceSettings.id, id));
  }

  // Site settings methods
  async getSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings);
  }

  async createSiteSetting(insertSiteSetting: InsertSiteSetting): Promise<SiteSetting> {
    const [siteSetting] = await db
      .insert(siteSettings)
      .values(insertSiteSetting)
      .returning();
    return siteSetting;
  }

  async updateSiteSetting(id: number, updates: Partial<SiteSetting>): Promise<SiteSetting> {
    const [siteSetting] = await db
      .update(siteSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(siteSettings.id, id))
      .returning();
    return siteSetting;
  }

  // Home images methods
  async getHomeImages(): Promise<HomeImage[]> {
    return await db.select().from(homeImages);
  }

  async createHomeImage(insertHomeImage: InsertHomeImage): Promise<HomeImage> {
    const [homeImage] = await db
      .insert(homeImages)
      .values(insertHomeImage)
      .returning();
    return homeImage;
  }

  async updateHomeImage(id: number, updates: Partial<HomeImage>): Promise<HomeImage> {
    const [homeImage] = await db
      .update(homeImages)
      .set(updates)
      .where(eq(homeImages.id, id))
      .returning();
    return homeImage;
  }

  async deleteHomeImage(id: number): Promise<void> {
    await db.delete(homeImages).where(eq(homeImages.id, id));
  }

  // Bottle samples methods
  async getBottleSamples(): Promise<BottleSample[]> {
    return await db.select().from(bottleSamples);
  }

  async getBottleSamplesByType(bottleType: string): Promise<BottleSample[]> {
    return await db.select().from(bottleSamples).where(eq(bottleSamples.bottleType, bottleType));
  }

  async createBottleSample(insertBottleSample: InsertBottleSample): Promise<BottleSample> {
    const [bottleSample] = await db
      .insert(bottleSamples)
      .values(insertBottleSample)
      .returning();
    return bottleSample;
  }

  async updateBottleSample(id: number, updates: Partial<BottleSample>): Promise<BottleSample> {
    const [bottleSample] = await db
      .update(bottleSamples)
      .set(updates)
      .where(eq(bottleSamples.id, id))
      .returning();
    return bottleSample;
  }

  async deleteBottleSample(id: number): Promise<void> {
    await db.delete(bottleSamples).where(eq(bottleSamples.id, id));
  }

  // Design samples methods
  async getDesignSamples(): Promise<DesignSample[]> {
    return await db.select().from(designSamples).where(eq(designSamples.isActive, true)).orderBy(desc(designSamples.createdAt));
  }

  async getDesignSamplesByCategory(category: string): Promise<DesignSample[]> {
    return await db.select().from(designSamples)
      .where(eq(designSamples.category, category))
      .orderBy(desc(designSamples.createdAt));
  }

  async createDesignSample(insertDesignSample: InsertDesignSample): Promise<DesignSample> {
    const [designSample] = await db
      .insert(designSamples)
      .values(insertDesignSample)
      .returning();
    return designSample;
  }

  async updateDesignSample(id: number, updates: Partial<DesignSample>): Promise<DesignSample> {
    const [designSample] = await db
      .update(designSamples)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(designSamples.id, id))
      .returning();
    return designSample;
  }

  async deleteDesignSample(id: number): Promise<void> {
    await db.delete(designSamples).where(eq(designSamples.id, id));
  }

  // User management methods
  async getUsers(): Promise<User[]> {
    // Only return regular users, not admin accounts
    return await db.select().from(users).where(eq(users.role, 'user'));
  }

  async getUserProfiles(): Promise<UserProfile[]> {
    return await db.select().from(userProfiles);
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async getUserProfileByEmail(email: string): Promise<UserProfile | undefined> {
    const userList = await db.select().from(users).where(eq(users.email, email));
    if (userList.length === 0) return undefined;
    
    const userId = userList[0].id;
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }



  async updateUserProfile(id: number, updates: Partial<UserProfile>): Promise<UserProfile> {
    const [profile] = await db
      .update(userProfiles)
      .set(updates)
      .where(eq(userProfiles.id, id))
      .returning();
    return profile;
  }

  // Activity logs methods
  async getUserActivityLogs(): Promise<UserActivityLog[]> {
    return await db.select().from(userActivityLogs);
  }

  async getUserActivityLogsByUserId(userId: number): Promise<UserActivityLog[]> {
    return await db.select().from(userActivityLogs).where(eq(userActivityLogs.userId, userId));
  }



  async deleteUserActivityLogs(userId: number): Promise<void> {
    await db.delete(userActivityLogs).where(eq(userActivityLogs.userId, userId));
  }

  // Additional user management methods
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }



  async deleteUser(id: number): Promise<void> {
    // Delete related records first to avoid foreign key constraint
    await db.delete(userActivityLogs).where(eq(userActivityLogs.userId, id));
    await db.delete(userProfiles).where(eq(userProfiles.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  async deleteUserProfile(userId: number): Promise<void> {
    await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
  }

  // Order campaign methods
  async getOrderCampaigns(): Promise<OrderCampaign[]> {
    return await db.select().from(orderCampaigns).orderBy(desc(orderCampaigns.submittedAt));
  }

  async getUserCampaigns(email: string): Promise<OrderCampaign[]> {
    return await db.select().from(orderCampaigns)
      .where(eq(orderCampaigns.email, email))
      .orderBy(desc(orderCampaigns.submittedAt));
  }

  async createOrderCampaign(insertOrderCampaign: InsertOrderCampaign): Promise<OrderCampaign> {
    const [campaign] = await db
      .insert(orderCampaigns)
      .values(insertOrderCampaign)
      .returning();
    return campaign;
  }

  async updateOrderCampaign(id: number, updates: Partial<OrderCampaign>): Promise<OrderCampaign> {
    const [campaign] = await db
      .update(orderCampaigns)
      .set(updates)
      .where(eq(orderCampaigns.id, id))
      .returning();
    return campaign;
  }

  async updateOrderCampaignStatus(id: number, updates: any): Promise<OrderCampaign> {
    const [campaign] = await db
      .update(orderCampaigns)
      .set(updates)
      .where(eq(orderCampaigns.id, id))
      .returning();
    return campaign;
  }

  // Email verification methods
  async createEmailVerification(verification: { email: string; otp: string; expiresAt: Date }): Promise<any> {
    const [emailVerification] = await db
      .insert(emailVerifications)
      .values(verification)
      .returning();
    return emailVerification;
  }

  async getEmailVerification(email: string, otp: string): Promise<any> {
    const results = await db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.email, email))
      .orderBy(emailVerifications.createdAt);
    
    const verification = results.find(v => v.otp === otp);
    return verification;
  }

  async getLatestVerification(email: string): Promise<any> {
    const [verification] = await db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.email, email))
      .orderBy(desc(emailVerifications.createdAt))
      .limit(1);
    return verification;
  }

  async markOTPAsUsed(id: number): Promise<void> {
    await db
      .update(emailVerifications)
      .set({ isUsed: true })
      .where(eq(emailVerifications.id, id));
  }

  // Payment Management methods
  async getPaymentAccounts(): Promise<PaymentAccount[]> {
    return await db.select().from(paymentAccounts).orderBy(desc(paymentAccounts.isDefault), desc(paymentAccounts.createdAt));
  }

  async createPaymentAccount(insertPaymentAccount: InsertPaymentAccount): Promise<PaymentAccount> {
    const [paymentAccount] = await db
      .insert(paymentAccounts)
      .values(insertPaymentAccount)
      .returning();
    return paymentAccount;
  }

  async updatePaymentAccount(id: number, updates: Partial<PaymentAccount>): Promise<PaymentAccount> {
    const [paymentAccount] = await db
      .update(paymentAccounts)
      .set(updates)
      .where(eq(paymentAccounts.id, id))
      .returning();
    return paymentAccount;
  }

  async deletePaymentAccount(id: number): Promise<void> {
    await db.delete(paymentAccounts).where(eq(paymentAccounts.id, id));
  }

  async setDefaultPaymentAccount(id: number): Promise<void> {
    // First, set all accounts to non-default
    await db.update(paymentAccounts).set({ isDefault: false });
    // Then set the specified account as default
    await db.update(paymentAccounts).set({ isDefault: true }).where(eq(paymentAccounts.id, id));
  }

  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async getTransactionByRef(transactionRef: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.transactionRef, transactionRef));
    return transaction || undefined;
  }

  async updateTransactionByRef(transactionRef: string, updates: Partial<Transaction>): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(transactions.transactionRef, transactionRef))
      .returning();
    return transaction;
  }

  async getPaymentSettings(): Promise<PaymentSetting[]> {
    return await db.select().from(paymentSettings).orderBy(paymentSettings.settingKey);
  }

  async createPaymentSetting(insertPaymentSetting: InsertPaymentSetting): Promise<PaymentSetting> {
    const [paymentSetting] = await db
      .insert(paymentSettings)
      .values(insertPaymentSetting)
      .returning();
    return paymentSetting;
  }

  async updatePaymentSetting(id: number, updates: Partial<PaymentSetting>): Promise<PaymentSetting> {
    const [paymentSetting] = await db
      .update(paymentSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(paymentSettings.id, id))
      .returning();
    return paymentSetting;
  }

  async deletePaymentSetting(id: number): Promise<void> {
    await db.delete(paymentSettings).where(eq(paymentSettings.id, id));
  }

  // Payment Gateway Configuration methods
  async getPaymentGatewaySettings(): Promise<PaymentGatewaySetting[]> {
    return await db.select().from(paymentGatewaySettings).orderBy(paymentGatewaySettings.gateway);
  }

  async getActivePaymentGateway(): Promise<PaymentGatewaySetting | undefined> {
    const [gateway] = await db.select().from(paymentGatewaySettings).where(eq(paymentGatewaySettings.isActive, true));
    return gateway || undefined;
  }

  async createPaymentGatewaySetting(gatewaySetting: InsertPaymentGatewaySetting): Promise<PaymentGatewaySetting> {
    const [gateway] = await db
      .insert(paymentGatewaySettings)
      .values(gatewaySetting)
      .returning();
    return gateway;
  }

  async updatePaymentGatewaySetting(id: number, updates: Partial<PaymentGatewaySetting>): Promise<PaymentGatewaySetting> {
    const [gateway] = await db
      .update(paymentGatewaySettings)
      .set({...updates, updatedAt: new Date()})
      .where(eq(paymentGatewaySettings.id, id))
      .returning();
    return gateway;
  }

  async setActivePaymentGateway(gatewayName: string): Promise<void> {
    // Deactivate all gateways first
    await db.update(paymentGatewaySettings).set({ isActive: false });
    // Activate the selected gateway
    await db
      .update(paymentGatewaySettings)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(paymentGatewaySettings.gateway, gatewayName));
  }

  // Logo management methods
  async getLogoSettings(): Promise<LogoSetting[]> {
    return await db.select().from(logoSettings).orderBy(desc(logoSettings.uploadedAt));
  }

  async createLogoSetting(insertLogoSetting: InsertLogoSetting): Promise<LogoSetting> {
    const [logoSetting] = await db
      .insert(logoSettings)
      .values(insertLogoSetting)
      .returning();
    return logoSetting;
  }

  async updateLogoSetting(id: number, updates: Partial<LogoSetting>): Promise<LogoSetting> {
    const [logoSetting] = await db
      .update(logoSettings)
      .set(updates)
      .where(eq(logoSettings.id, id))
      .returning();
    return logoSetting;
  }

  async deleteLogoSetting(id: number): Promise<void> {
    await db.delete(logoSettings).where(eq(logoSettings.id, id));
  }

  async setActiveLogo(id: number): Promise<void> {
    // Deactivate all logos first
    await db.update(logoSettings).set({ isActive: false });
    // Activate the selected logo
    await db.update(logoSettings).set({ isActive: true }).where(eq(logoSettings.id, id));
  }

  async getActiveLogo(): Promise<LogoSetting | undefined> {
    const [activeLogo] = await db.select().from(logoSettings).where(eq(logoSettings.isActive, true));
    return activeLogo || undefined;
  }

  // Phone OTP methods
  async createPhoneOTP(phoneOtp: InsertPhoneOtp): Promise<PhoneOtp> {
    const [otp] = await db.insert(phoneOtps).values(phoneOtp).returning();
    return otp;
  }

  async getPhoneOTP(phone: string, otp: string, purpose: string): Promise<PhoneOtp | undefined> {
    const [otpRecord] = await db
      .select()
      .from(phoneOtps)
      .where(sql`phone = ${phone} AND otp = ${otp} AND purpose = ${purpose} AND is_used = false`)
      .orderBy(desc(phoneOtps.createdAt))
      .limit(1);
    return otpRecord || undefined;
  }

  async markPhoneOTPAsUsed(id: number): Promise<void> {
    await db.update(phoneOtps).set({ isUsed: true }).where(eq(phoneOtps.id, id));
  }

  // Password reset methods
  async createPasswordResetOtp(resetOtp: InsertPasswordResetOtp): Promise<PasswordResetOtp> {
    const [otp] = await db.insert(passwordResetOtps).values(resetOtp).returning();
    return otp;
  }

  async verifyPasswordResetOtp(userId: number, otp: string): Promise<boolean> {
    const [otpRecord] = await db
      .select()
      .from(passwordResetOtps)
      .where(sql`user_id = ${userId} AND otp = ${otp} AND is_used = false AND expires_at > NOW()`)
      .orderBy(desc(passwordResetOtps.createdAt))
      .limit(1);
    
    if (otpRecord) {
      // Mark OTP as used
      await db.update(passwordResetOtps).set({ isUsed: true }).where(eq(passwordResetOtps.id, otpRecord.id));
      return true;
    }
    
    return false;
  }

  async markPasswordResetOtpsAsUsed(userId: number): Promise<void> {
    await db.update(passwordResetOtps)
      .set({ isUsed: true })
      .where(eq(passwordResetOtps.userId, userId));
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));
  }

  // Site visitor tracking methods
  async createSiteVisitor(visitor: InsertSiteVisitor): Promise<SiteVisitor> {
    const [newVisitor] = await db.insert(siteVisitors).values(visitor).returning();
    return newVisitor;
  }

  async updateSiteVisitorActivity(sessionId: string): Promise<void> {
    await db.update(siteVisitors)
      .set({ lastActivityAt: new Date() })
      .where(eq(siteVisitors.sessionId, sessionId));
  }

  async markVisitorInactive(sessionId: string): Promise<void> {
    await db.update(siteVisitors)
      .set({ isActive: false })
      .where(eq(siteVisitors.sessionId, sessionId));
  }

  async getActiveSiteVisitors(): Promise<SiteVisitor[]> {
    return await db.select()
      .from(siteVisitors)
      .where(sql`is_active = true AND last_activity_at > NOW() - INTERVAL '10 minutes'`);
  }

  async getSiteVisitorStats(): Promise<{
    totalActiveVisitors: number;
    totalVisitorsToday: number;
    totalVisitorsThisWeek: number;
    totalVisitorsThisMonth: number;
  }> {
    const activeVisitors = await db.select({ count: sql<number>`count(*)` })
      .from(siteVisitors)
      .where(sql`is_active = true AND last_activity_at > NOW() - INTERVAL '10 minutes'`);

    const todayVisitors = await db.select({ count: sql<number>`count(DISTINCT session_id)` })
      .from(siteVisitors)
      .where(sql`visited_at >= CURRENT_DATE`);

    const weekVisitors = await db.select({ count: sql<number>`count(DISTINCT session_id)` })
      .from(siteVisitors)
      .where(sql`visited_at >= CURRENT_DATE - INTERVAL '7 days'`);

    const monthVisitors = await db.select({ count: sql<number>`count(DISTINCT session_id)` })
      .from(siteVisitors)
      .where(sql`visited_at >= CURRENT_DATE - INTERVAL '30 days'`);

    return {
      totalActiveVisitors: activeVisitors[0]?.count || 0,
      totalVisitorsToday: todayVisitors[0]?.count || 0,
      totalVisitorsThisWeek: weekVisitors[0]?.count || 0,
      totalVisitorsThisMonth: monthVisitors[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
