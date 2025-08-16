import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Contact, type Campaign, type PriceSetting, type BottleSample, type User, type UserProfile, type UserActivityLog, type LogoSetting, type DesignSample } from "@shared/schema";
import { toast } from "@/hooks/use-toast";
import PaymentGatewaySettings from '@/components/PaymentGatewaySettings';



function Admin() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState<PriceSetting | null>(null);
  const [uploadingBottle, setUploadingBottle] = useState(false);
  const [selectedBottleType, setSelectedBottleType] = useState<'1L'>('1L');
  const [modalPriceData, setModalPriceData] = useState({
    pricePerBottle: 0,
    discountPercentage: 0
  });
  const [websiteContent, setWebsiteContent] = useState({
    trustedBadge: "TRUSTED BY THOUSANDS",
    heroTitle: {
      line1: "Custom Bottle",
      line2: "Advertising", 
      line3: "Revolution"
    },
    heroDescription: "Turn every water bottle into a walking billboard for your brand! Your advertisement travels everywhere - from offices to gyms, parks to cafes. Reach thousands of potential customers as your branded bottles become mobile marketing machines that work 24/7 across India.",
    ctaButtonText: "Start Creating Now",
    stats: [
      { number: "50K+", label: "Bottles Delivered" },
      { number: "500+", label: "Happy Clients" },
      { number: "7", label: "Days Delivery" }
    ],
    bottleSection: {
      title: "See How Your Brand Looks on Bottles",
      subtitle: "Real bottle samples showing how your promotional design will appear"
    },
    pageTitle: "IamBillBoard - Custom Bottle Advertising",
    metaDescription: "Transform ordinary water bottles into powerful marketing tools. Custom bottle advertising that reaches customers wherever they go across India.",
    features: [
      { icon: "✅", title: "Quality Assurance", desc: "Level Up Water's proven quality with IamBillBoard's creative expertise" },
      { icon: "⚡", title: "Fast Production", desc: "Established supply chain ensures quick delivery and consistent availability" },
      { icon: "💰", title: "Best Value", desc: "Partnership benefits deliver both competitive pricing and premium quality" }
    ],
    workflowSteps: [
      { number: 1, title: "Upload Your Branding", desc: "Submit your logo, ad design, or any branding material you'd like printed." },
      { number: 2, title: "Select Quantity", desc: "Choose how many bottles you want branded (minimum 1000 bottles)." },
      { number: 3, title: "Design Approval", desc: "Our team reviews your submission for quality and compliance." },
      { number: 4, title: "Receive Your Bottles", desc: "Get your custom branded water bottles delivered in 7-10 business days." }
    ],
    approvalSteps: [
      { number: 1, title: "Submission Received", desc: "We'll send an email confirmation immediately with your order details and estimated timeline." },
      { number: 2, title: "Design Review", desc: "Our quality team examines your design for print compatibility and brand guidelines." },
      { number: 3, title: "Production Start", desc: "Once approved, your bottles enter our production queue with Level Up Water." },
      { number: 4, title: "Quality Check", desc: "Final inspection ensures every bottle meets our high standards before shipping." }
    ],
    contactInfo: {
      phone: "+91 9876543210",
      email: "info@billboardwalker.com",
      address: "Mumbai, Maharashtra, India"
    }
  });
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [savingChanges, setSavingChanges] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    gmailUser: '',
    gmailPassword: '',
    fromName: 'IamBillBoard'
  });

  const [smsConfig, setSmsConfig] = useState({
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioFromNumber: '',
    isEnabled: false
  });

  // Admin Settings State
  const [adminSettings, setAdminSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Payment Management State
  const [showPaymentAccountModal, setShowPaymentAccountModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Design Samples State
  const [showDesignSampleModal, setShowDesignSampleModal] = useState(false);
  const [editingDesignSample, setEditingDesignSample] = useState<DesignSample | null>(null);
  const [uploadingDesignSample, setUploadingDesignSample] = useState(false);
  const [designSampleData, setDesignSampleData] = useState({
    title: '',
    description: '',
    category: 'business',
    isActive: true
  });

  // Campaign Management State
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignStatus, setCampaignStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Design reupload system states
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [reuploadFeedback, setReuploadFeedback] = useState('');
  const [reuploadReason, setReuploadReason] = useState('');
  const [reuploadCampaign, setReuploadCampaign] = useState<Campaign | null>(null);
  const [updatingCampaign, setUpdatingCampaign] = useState(false);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = () => {
    // Load saved configurations after successful auth
    const savedEmailConfig = localStorage.getItem('billboardwalker_email_config');
    if (savedEmailConfig) {
      try {
        const config = JSON.parse(savedEmailConfig);
        setEmailConfig(config);
      } catch (error) {
        console.log('Error loading email config');
      }
    }

    const savedSmsConfig = localStorage.getItem('billboardwalker_sms_config');
    if (savedSmsConfig) {
      try {
        const config = JSON.parse(savedSmsConfig);
        setSmsConfig(config);
      } catch (error) {
        console.log('Error loading SMS config');
      }
    }
  };



  // Fetch data - direct access without authentication
  const { data: contacts = [], isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"]
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"]
  });

  const { data: priceSettings = [], isLoading: pricesLoading } = useQuery<PriceSetting[]>({
    queryKey: ["/api/price-settings"]
  });

  const { data: bottleSamples = [], isLoading: bottlesLoading } = useQuery<BottleSample[]>({
    queryKey: ["/api/bottle-samples"]
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"]
  });

  const { data: userProfiles = [], isLoading: profilesLoading } = useQuery<UserProfile[]>({
    queryKey: ["/api/user-profiles"]
  });

  const { data: activityLogs = [], isLoading: logsLoading } = useQuery<UserActivityLog[]>({
    queryKey: ["/api/activity-logs"]
  });

  const { data: orderCampaigns = [], isLoading: orderCampaignsLoading } = useQuery<any[]>({
    queryKey: ["/api/order-campaigns"]
  });

  // Payment Management queries
  const { data: paymentAccounts = [], isLoading: paymentAccountsLoading } = useQuery<any[]>({
    queryKey: ["/api/payment-accounts"]
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<any[]>({
    queryKey: ["/api/transactions"]
  });

  // Logo Management queries
  const { data: logoSettings = [], isLoading: logoSettingsLoading } = useQuery<LogoSetting[]>({
    queryKey: ["/api/logo-settings"]
  });

  // Design Samples queries
  const { data: designSamples = [], isLoading: designSamplesLoading } = useQuery<DesignSample[]>({
    queryKey: ["/api/design-samples"]
  });

  // Site Visitors queries
  const { data: visitorStats, isLoading: visitorStatsLoading } = useQuery<{
    totalActiveVisitors: number;
    totalVisitorsToday: number;
    totalVisitorsThisWeek: number;
    totalVisitorsThisMonth: number;
  }>({
    queryKey: ["/api/visitors/stats"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: activeVisitors = [], isLoading: activeVisitorsLoading } = useQuery<any[]>({
    queryKey: ["/api/visitors/active"],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Remove early returns to fix hooks issue

  // Website Editor Functions
  const handleSaveChanges = async () => {
    setSavingChanges(true);
    try {
      // Save to localStorage for now (can be extended to save to database)
      localStorage.setItem('billboardwalker_website_content', JSON.stringify(websiteContent));
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      alert('Website changes saved successfully!');
    } catch (error) {
      alert('Error saving changes. Please try again.');
    } finally {
      setSavingChanges(false);
    }
  };

  const handleDownloadWebsite = () => {
    const htmlContent = generateWebsiteHTML(websiteContent);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'billboard-walker-website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddFeature = () => {
    setWebsiteContent(prev => ({
      ...prev,
      features: [...prev.features, { icon: '🎯', title: 'New Feature', desc: 'Feature description...' }]
    }));
  };

  const handleUpdateFeature = (index: number, field: string, value: string) => {
    setWebsiteContent(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setWebsiteContent(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };



  const handleResetToDefault = () => {
    if (confirm('Are you sure you want to reset to default settings? This will lose all your changes.')) {
      setWebsiteContent({
        // Hero Section Content
        trustedBadge: "TRUSTED BY THOUSANDS",
        heroTitle: {
          line1: "Custom Bottle",
          line2: "Advertising", 
          line3: "Revolution"
        },
        heroDescription: "Turn every water bottle into a walking billboard for your brand! Your advertisement travels everywhere - from offices to gyms, parks to cafes. Reach thousands of potential customers as your branded bottles become mobile marketing machines that work 24/7 across India.",
        ctaButtonText: "Start Creating Now",
        
        // Stats Section
        stats: [
          { number: "50K+", label: "Bottles Delivered" },
          { number: "500+", label: "Happy Clients" },
          { number: "7", label: "Days Delivery" }
        ],
        
        // Bottle Section
        bottleSection: {
          title: "See How Your Brand Looks on Bottles",
          subtitle: "Real bottle samples showing how your promotional design will appear"
        },
        
        // Page Meta
        pageTitle: "IamBillBoard - Custom Bottle Advertising",
        metaDescription: "Transform ordinary water bottles into powerful marketing tools. Custom bottle advertising that reaches customers wherever they go across India.",
        
        // Features for other sections
        features: [
          { icon: "🎨", title: "3D Design Studio", desc: "Interactive 3D bottle designer with real-time preview" },
          { icon: "🚀", title: "Fast Delivery", desc: "Quick production across India with quality assurance" },
          { icon: "💰", title: "Affordable Pricing", desc: "Starting from ₹70 for 750ml bottles. Bulk discounts available" }
        ],
        contactInfo: {
          phone: "+91 9876543210",
          email: "info@billboardwalker.com",
          address: "Mumbai, Maharashtra, India"
        },
        workflowSteps: [
          { number: 1, title: "Design", desc: "Create your bottle design" },
          { number: 2, title: "Preview", desc: "See 3D preview" },
          { number: 3, title: "Order", desc: "Place your order" },
          { number: 4, title: "Delivery", desc: "Get delivered" }
        ],
        approvalSteps: [
          { number: 1, title: "Submit", desc: "Submit your design" },
          { number: 2, title: "Review", desc: "Admin review" },
          { number: 3, title: "Approve", desc: "Design approved" },
          { number: 4, title: "Production", desc: "Start production" }
        ]
      });
    }
  };

  const generateWebsiteHTML = (content: any) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #1a1a1a 0%, #2d1b69 100%); color: white; min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 60px 0; }
        .hero-title { font-size: 3rem; font-weight: bold; margin-bottom: 20px; background: linear-gradient(135deg, #ff6b6b, #ffd93d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-subtitle { font-size: 1.5rem; color: #ff6b6b; margin-bottom: 15px; }
        .hero-description { font-size: 1.1rem; color: #ccd6f6; max-width: 600px; margin: 0 auto; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin: 60px 0; }
        .feature { background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
        .feature-icon { font-size: 3rem; margin-bottom: 15px; }
        .feature-title { font-size: 1.3rem; font-weight: bold; margin-bottom: 10px; }
        .feature-desc { color: #ccd6f6; line-height: 1.6; }
        .contact { background: rgba(255, 255, 255, 0.1); padding: 40px; border-radius: 15px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); text-align: center; margin: 60px 0; }
        .contact h2 { font-size: 2rem; margin-bottom: 30px; }
        .contact-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .contact-item { padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .footer { text-align: center; padding: 40px 0; border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 60px; }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1 class="hero-title">${content.title}</h1>
            <h2 class="hero-subtitle">${content.heroText}</h2>
            <p class="hero-description">${content.description}</p>
        </header>

        <section class="features">
            ${content.features.map((feature: any) => `
                <div class="feature">
                    <div class="feature-icon">${feature.icon}</div>
                    <h3 class="feature-title">${feature.title}</h3>
                    <p class="feature-desc">${feature.desc}</p>
                </div>
            `).join('')}
        </section>

        <section class="contact">
            <h2>Contact Information</h2>
            <div class="contact-info">
                <div class="contact-item">
                    <strong>📞 Phone:</strong><br>${content.contactInfo.phone}
                </div>
                <div class="contact-item">
                    <strong>✉️ Email:</strong><br>${content.contactInfo.email}
                </div>
                <div class="contact-item">
                    <strong>📍 Address:</strong><br>${content.contactInfo.address}
                </div>
            </div>
        </section>

        <footer class="footer">
            <p>&copy; 2025 ${content.title}. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>`;
  };

  // Admin Settings Functions
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    
    try {
      if (adminSettings.newPassword !== adminSettings.confirmPassword) {
        alert('नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते!');
        return;
      }
      
      if (adminSettings.newPassword.length < 6) {
        alert('नया पासवर्ड कम से कम 6 अक्षर का होना चाहिए!');
        return;
      }
      
      // Send password change request to backend
      const response = await apiRequest('/api/change-admin-password', {
        method: 'POST',
        body: {
          currentPassword: adminSettings.currentPassword,
          newPassword: adminSettings.newPassword
        }
      });
      
      if (response.success) {
        alert('पासवर्ड सफलतापूर्वक बदल दिया गया है!');
        setAdminSettings({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert(response.message || 'पासवर्ड बदलने में त्रुटि हुई है!');
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert('पासवर्ड बदलने में त्रुटि हुई है!');
    } finally {
      setChangingPassword(false);
    }
  };

  // Campaign mutations
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: number; status: string; rejectionReason?: string }) => {
      return apiRequest("PATCH", `/api/campaigns/${id}/status`, { 
        status, 
        rejectionReason: rejectionReason || null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setShowCampaignModal(false);
      setSelectedCampaign(null);
      setCampaignStatus('');
      setRejectionReason('');
    },
  });

  // Design reupload mutation
  const requestReuploadMutation = useMutation({
    mutationFn: async ({ id, feedback, rejectionReason }: { id: number; feedback: string; rejectionReason: string }) => {
      return apiRequest("POST", `/api/campaigns/${id}/request-design-reupload`, { 
        feedback, 
        rejectionReason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setShowReuploadModal(false);
      setReuploadCampaign(null);
      setReuploadFeedback('');
      setReuploadReason('');
      toast({
        title: "Success",
        description: "Design reupload request sent to user with email notification",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reupload request",
        variant: "destructive",
      });
    },
  });

  // Price mutations
  const savePriceMutation = useMutation({
    mutationFn: async (priceData: any) => {
      if (editingPrice) {
        return apiRequest("PATCH", `/api/price-settings/${editingPrice.id}`, priceData);
      } else {
        return apiRequest("POST", "/api/price-settings", priceData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-settings"] });
      setShowPriceModal(false);
      setEditingPrice(null);
    },
  });

  const deletePriceMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/price-settings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-settings"] });
    },
  });

  const updatePriceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return apiRequest("PATCH", `/api/price-settings/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-settings"] });
    },
  });

  // Logo mutations
  const uploadLogoMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log('Starting logo upload...');
      const response = await fetch('/api/logo-settings/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Logo upload failed:', errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Logo upload successful:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Logo upload mutation success callback');
      queryClient.invalidateQueries({ queryKey: ["/api/logo-settings"] });
      setUploadingLogo(false);
      setLogoFile(null);
      toast({
        title: "Success",
        description: "Logo uploaded successfully!",
      });
    },
    onError: (error) => {
      console.error('Logo upload error:', error);
      setUploadingLogo(false);
      toast({
        title: "Error",
        description: `Failed to upload logo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const activateLogoMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PATCH", `/api/logo-settings/${id}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logo-settings"] });
    },
  });

  const deleteLogoMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/logo-settings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logo-settings"] });
    },
  });



  // Bottle samples mutations
  const uploadBottleMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log('Starting bottle sample upload...');
      const response = await fetch("/api/bottle-samples", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Bottle upload failed:', errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Bottle upload successful:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Bottle upload mutation success callback');
      queryClient.invalidateQueries({ queryKey: ["/api/bottle-samples"] });
      setUploadingBottle(false);
      toast({
        title: "Success",
        description: "Bottle sample uploaded successfully!",
      });
    },
    onError: (error) => {
      console.error('Bottle upload error:', error);
      setUploadingBottle(false);
      toast({
        title: "Error", 
        description: `Failed to upload bottle sample: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteBottleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/bottle-samples/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bottle-samples"] });
    },
  });

  const updateBottleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return apiRequest("PATCH", `/api/bottle-samples/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bottle-samples"] });
    },
  });



  const handleCampaignAction = (campaignId: number, status: string, notes?: string) => {
    updateCampaignMutation.mutate({ id: campaignId, status, rejectionReason: notes });
  };

  // Campaign modal functions
  const openCampaignModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setCampaignStatus(campaign.status);
    setRejectionReason(campaign.rejectionReason || '');
    setShowCampaignModal(true);
  };

  const openReuploadModal = (campaign: Campaign) => {
    setReuploadCampaign(campaign);
    setReuploadFeedback('');
    setReuploadReason('');
    setShowReuploadModal(true);
  };

  const handleRequestReupload = () => {
    if (!reuploadCampaign || !reuploadFeedback.trim() || !reuploadReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide both feedback and rejection reason",
        variant: "destructive",
      });
      return;
    }

    requestReuploadMutation.mutate({
      id: reuploadCampaign.id,
      feedback: reuploadFeedback.trim(),
      rejectionReason: reuploadReason.trim()
    });
  };

  const handleUpdateCampaign = () => {
    if (!selectedCampaign) return;
    
    setUpdatingCampaign(true);
    updateCampaignMutation.mutate({
      id: selectedCampaign.id,
      status: campaignStatus,
      rejectionReason: campaignStatus === 'rejected' ? rejectionReason : undefined
    });
    setUpdatingCampaign(false);
  };

  // Design Download Function
  const handleDownloadDesign = async (campaign: Campaign) => {
    if (!campaign.designUrl) {
      toast({
        title: "Error",
        description: "No design file available for download",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use the API endpoint to download the design
      const response = await fetch(`/api/campaigns/${campaign.id}/design`);
      if (!response.ok) throw new Error('Failed to fetch design');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Use the original filename if available, otherwise create one
      const fileName = campaign.uploadedDesignFileName || 
                      `campaign-${campaign.id}-design.${getFileExtension(campaign.designUrl)}`;
      
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Design downloaded: ${fileName}`,
      });
    } catch (error) {
      console.error('Error downloading design:', error);
      toast({
        title: "Error", 
        description: "Failed to download design. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Helper function to get file extension from URL
  const getFileExtension = (url: string) => {
    const urlParts = url.split('.');
    return urlParts[urlParts.length - 1] || 'jpg';
  };

  // Order campaign status update mutation
  const updateOrderCampaignMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      return apiRequest("PATCH", `/api/order-campaigns/${id}/status`, { 
        status, 
        notes: notes || '',
        reviewedBy: 'Admin'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/order-campaigns"] });
    },
  });

  const handleOrderCampaignAction = (campaignId: number, status: string, notes?: string) => {
    const confirmMessage = status === 'approved' ? 'Approve this campaign?' : 
                          status === 'declined' ? 'Decline this campaign?' :
                          status === 'in_production' ? 'Start production for this campaign?' :
                          status === 'dispatched' ? 'Mark this campaign as dispatched?' :
                          status === 'completed' ? 'Mark this campaign as completed?' :
                          'Update campaign status?';
    
    if (confirm(confirmMessage)) {
      updateOrderCampaignMutation.mutate({ id: campaignId, status, notes });
    }
  };



  const handleBottleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;



    const formData = new FormData();
    formData.append('image', file);
    formData.append('bottleType', selectedBottleType);
    formData.append('isActive', 'true');

    toast({
      title: "Uploading Bottle Sample",
      description: `Uploading ${file.name}...`,
    });

    setUploadingBottle(true);
    uploadBottleMutation.mutate(formData);
  };

  const handleDeleteBottle = (id: number) => {
    if (confirm('Are you sure you want to delete this bottle sample?')) {
      deleteBottleMutation.mutate(id);
    }
  };

  const handleToggleBottleStatus = (id: number, currentStatus: boolean) => {
    updateBottleMutation.mutate({
      id,
      updates: { isActive: !currentStatus }
    });
  };

  // Design Samples mutations
  const uploadDesignSampleMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest("POST", "/api/design-samples", formData);
    },
    onSuccess: () => {
      setUploadingDesignSample(false);
      setShowDesignSampleModal(false);
      setDesignSampleData({ title: '', description: '', category: 'business', isActive: true });
      setSelectedDesignFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/design-samples"] });
    },
    onError: () => {
      setUploadingDesignSample(false);
      alert('Failed to upload design sample');
    }
  });

  const updateDesignSampleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return apiRequest("PATCH", `/api/design-samples/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/design-samples"] });
    },
  });

  const deleteDesignSampleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/design-samples/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/design-samples"] });
    },
  });

  // Design Samples handlers
  const [selectedDesignFile, setSelectedDesignFile] = useState<File | null>(null);

  const handleDesignSampleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedDesignFile(null);
      return;
    }



    toast({
      title: "File Selected",
      description: `${file.name} ready for upload`,
    });
    setSelectedDesignFile(file);
  };

  const handleDesignSampleUpload = () => {
    if (!selectedDesignFile) {
      toast({
        title: "Upload Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }
    if (!designSampleData.title.trim()) {
      toast({
        title: "Upload Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }



    const formData = new FormData();
    formData.append('image', selectedDesignFile);
    formData.append('title', designSampleData.title);
    formData.append('description', designSampleData.description);
    formData.append('category', designSampleData.category);
    formData.append('isActive', designSampleData.isActive.toString());

    console.log('Uploading design sample:', {
      fileName: selectedDesignFile.name,
      fileSize: selectedDesignFile.size,
      title: designSampleData.title,
      category: designSampleData.category
    });

    toast({
      title: "Uploading Design Sample",
      description: `Uploading ${selectedDesignFile.name}...`,
    });

    setUploadingDesignSample(true);
    uploadDesignSampleMutation.mutate(formData);
  };

  const handleDeleteDesignSample = (id: number) => {
    if (confirm('Are you sure you want to delete this design sample?')) {
      deleteDesignSampleMutation.mutate(id);
    }
  };

  const handleToggleDesignSampleStatus = (id: number, currentStatus: boolean) => {
    updateDesignSampleMutation.mutate({
      id,
      updates: { isActive: !currentStatus }
    });
  };

  const handleEditDesignSample = (sample: DesignSample) => {
    setEditingDesignSample(sample);
    setDesignSampleData({
      title: sample.title,
      description: sample.description || '',
      category: sample.category,
      isActive: sample.isActive
    });
    setShowDesignSampleModal(true);
  };

  const handleUpdateDesignSample = () => {
    if (!editingDesignSample) return;
    
    updateDesignSampleMutation.mutate({
      id: editingDesignSample.id,
      updates: designSampleData
    });
    
    setEditingDesignSample(null);
    setShowDesignSampleModal(false);
    setDesignSampleData({ title: '', description: '', category: 'business', isActive: true });
  };

  // Payment Management Handlers
  const handleSetDefaultAccount = async (accountId: number) => {
    try {
      await apiRequest('POST', `/api/payment-accounts/${accountId}/set-default`);
      queryClient.invalidateQueries({ queryKey: ['/api/payment-accounts'] });
    } catch (error) {
      alert('Failed to set default account');
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    if (confirm('Are you sure you want to delete this payment account?')) {
      try {
        await apiRequest('DELETE', `/api/payment-accounts/${accountId}`);
        queryClient.invalidateQueries({ queryKey: ['/api/payment-accounts'] });
      } catch (error) {
        alert('Failed to delete account');
      }
    }
  };

  const handleViewTransactionDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "declined": return "bg-red-100 text-red-800 border-red-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      <div className="w-full max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-2 sm:py-6">
        {/* Header - Mobile Responsive */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Mobile Header - Force Compact */}
            <div className="admin-mobile-header flex items-center justify-between sm:hidden">
              <div className="flex items-center space-x-1 min-w-0 flex-1">
                <img 
                  src="https://via.placeholder.com/40x40/ff6b6b/ffffff?text=IB" 
                  alt="IamBillBoard" 
                  className="w-5 h-5 object-contain filter drop-shadow-lg flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-xs font-bold text-white truncate">IamBillBoard</h1>
                  <p className="text-[10px] text-pink-400 font-medium">Admin</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <a 
                  href="/" 
                  className="home-button bg-green-500 hover:bg-green-600 text-white px-1 py-1 rounded text-xs transition-colors"
                  title="Home"
                >
                  🏠
                </a>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src="https://via.placeholder.com/40x40/ff6b6b/ffffff?text=IB" 
                  alt="IamBillBoard Logo" 
                  className="w-16 h-16 lg:w-20 lg:h-20 object-contain filter drop-shadow-lg"
                />
                <div>
                  <h1 className="text-2xl lg:text-4xl font-black text-white mb-1 lg:mb-2">
                    IamBillBoard <span className="gradient-text">Admin Panel</span>
                  </h1>
                  <p className="text-sm text-gray-300">Manage campaigns, pricing, and website settings</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a 
                  href="/dashboard" 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"></path>
                  </svg>
                  <span>Dashboard</span>
                </a>
                <a 
                  href="/" 
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  <span>Home</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Mobile Responsive */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm p-2 rounded-xl border border-gray-700/50">
            {/* Mobile Grid Layout - All Tabs */}
            <div className="grid grid-cols-5 sm:hidden gap-1">
              {[
                { id: "campaigns", label: "Campaigns", icon: "📋", shortLabel: "Campaigns" },
                { id: "contacts", label: "Contact Messages", icon: "📞", shortLabel: "Contact" },
                { id: "users", label: "Users Management", icon: "👥", shortLabel: "Users" },
                { id: "pricing", label: "Price Management", icon: "💰", shortLabel: "Price" },
                { id: "website-editor", label: "Website Editor", icon: "🌐", shortLabel: "Website" },
                { id: "logo-manager", label: "Logo Manager", icon: "🖼️", shortLabel: "Logo" },
                { id: "bottles", label: "Bottle Samples", icon: "🍼", shortLabel: "Bottles" },
                { id: "admin-settings", label: "Admin Settings", icon: "⚙️", shortLabel: "Settings" },
                { id: "activity", label: "Activity Logs", icon: "📊", shortLabel: "Activity" },
                { id: "design-samples", label: "Design Samples", icon: "🎨", shortLabel: "Designs" },
                { id: "revenue", label: "Revenue & Transactions", icon: "💰", shortLabel: "Revenue" },
                { id: "payment-accounts", label: "Payment Accounts", icon: "🏦", shortLabel: "Accounts" },
                { id: "payment-gateways", label: "Payment Gateways", icon: "💳", shortLabel: "Gateway" },
                { id: "site-visitors", label: "Site Visitors", icon: "👥", shortLabel: "Visitors" },
                { id: "email", label: "Email Setup", icon: "📧", shortLabel: "Email" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex flex-col items-center justify-center gap-0.5 
                    px-1 py-1.5 rounded-lg transition-all duration-300 min-h-[50px]
                    ${activeTab === tab.id
                      ? "bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }
                  `}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span className="text-[7px] font-medium leading-tight text-center px-0.5">{tab.shortLabel}</span>
                </button>
              ))}
            </div>

            {/* Desktop Horizontal Layout */}
            <div className="hidden sm:flex overflow-x-auto scrollbar-hide gap-2 py-1">
              {[
                { id: "website-editor", label: "Website Editor", icon: "🌐" },
                { id: "logo-manager", label: "Logo Manager", icon: "🖼️" },
                { id: "campaigns", label: "Campaigns", icon: "📋" },
                { id: "contacts", label: "Contact Messages", icon: "📞" },
                { id: "users", label: "Users Management", icon: "👥" },
                { id: "activity", label: "Activity Logs", icon: "📊" },
                { id: "pricing", label: "Price Management", icon: "💰" },
                { id: "bottles", label: "Bottle Samples", icon: "🍼" },
                { id: "design-samples", label: "Design Samples", icon: "🎨" },
                { id: "revenue", label: "Revenue & Transactions", icon: "💰" },
                { id: "payment-accounts", label: "Payment Accounts", icon: "🏦" },
                { id: "payment-gateways", label: "Payment Gateways", icon: "💳" },
                { id: "site-visitors", label: "Site Visitors", icon: "👥" },
                { id: "email", label: "Email Setup", icon: "📧" },
                { id: "admin-settings", label: "Admin Settings", icon: "⚙️" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 
                    whitespace-nowrap flex-shrink-0 
                    ${activeTab === tab.id
                      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "website-editor" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Homepage Content Editor</h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleSaveChanges}
                  disabled={savingChanges}
                  className="px-4 sm:px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  {savingChanges ? "Saving..." : "💾 Save Changes"}
                </button>
                <button
                  onClick={handleDownloadWebsite}
                  className="px-4 sm:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  📥 Download HTML
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Panel - Editor */}
              <div className="space-y-6">
                {/* Website Title & Hero Section */}
                <div className="bg-white/10 rounded-xl p-6 border border-white/20 glass-effect">
                  <h3 className="text-xl font-bold text-white mb-4">🏠 Hero Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Website Title</label>
                      <input
                        type="text"
                        value={websiteContent.pageTitle}
                        onChange={(e) => setWebsiteContent(prev => ({...prev, pageTitle: e.target.value}))}
                        className="w-full px-4 py-2 rounded-lg bg-black/30 text-white border border-white/20 focus:border-blue-500 focus:outline-none"
                        placeholder="Enter website title..."
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Hero Text</label>
                      <input
                        type="text"
                        value={websiteContent.heroDescription}
                        onChange={(e) => setWebsiteContent(prev => ({...prev, heroDescription: e.target.value}))}
                        className="w-full px-4 py-2 rounded-lg bg-black/30 text-white border border-white/20 focus:border-blue-500 focus:outline-none"
                        placeholder="Enter hero text..."
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={websiteContent.metaDescription}
                        onChange={(e) => setWebsiteContent(prev => ({...prev, metaDescription: e.target.value}))}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg bg-black/30 text-white border border-white/20 focus:border-blue-500 focus:outline-none"
                        placeholder="Enter website description..."
                      />
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div className="bg-white/10 rounded-xl p-6 border border-white/20 glass-effect">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">⭐ Features Section</h3>
                    <button
                      onClick={handleAddFeature}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                    >
                      ➕ Add Feature
                    </button>
                  </div>
                  <div className="space-y-4">
                    {websiteContent.features.map((feature, index) => (
                      <div key={index} className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-white font-medium">Feature #{index + 1}</span>
                          <button
                            onClick={() => handleRemoveFeature(index)}
                            className="text-red-400 hover:text-red-300 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid gap-3">
                          <input
                            type="text"
                            value={feature.icon}
                            onChange={(e) => handleUpdateFeature(index, 'icon', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/20 focus:border-blue-500 focus:outline-none text-sm"
                            placeholder="Icon (emoji)"
                          />
                          <input
                            type="text"
                            value={feature.title}
                            onChange={(e) => handleUpdateFeature(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/20 focus:border-blue-500 focus:outline-none text-sm"
                            placeholder="Feature title"
                          />
                          <textarea
                            value={feature.desc}
                            onChange={(e) => handleUpdateFeature(index, 'desc', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg bg-black/30 text-white border border-white/20 focus:border-blue-500 focus:outline-none text-sm resize-none"
                            placeholder="Feature description"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white/10 rounded-xl p-6 border border-white/20 glass-effect">
                  <h3 className="text-xl font-bold text-white mb-4">📞 Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Phone</label>
                      <input
                        type="text"
                        value={websiteContent.contactInfo.phone}
                        onChange={(e) => setWebsiteContent(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, phone: e.target.value }
                        }))}
                        className="w-full px-4 py-2 rounded-lg bg-black/30 text-white border border-white/20 focus:border-blue-500 focus:outline-none"
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={websiteContent.contactInfo.email}
                        onChange={(e) => setWebsiteContent(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, email: e.target.value }
                        }))}
                        className="w-full px-4 py-2 rounded-lg bg-black/30 text-white border border-white/20 focus:border-blue-500 focus:outline-none"
                        placeholder="Email address"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Address</label>
                      <input
                        type="text"
                        value={websiteContent.contactInfo.address}
                        onChange={(e) => setWebsiteContent(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, address: e.target.value }
                        }))}
                        className="w-full px-4 py-2 rounded-lg bg-black/30 text-white border border-white/20 focus:border-blue-500 focus:outline-none"
                        placeholder="Business address"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Live Preview */}
              <div className="bg-white/10 rounded-xl p-6 border border-white/20 glass-effect">
                <h3 className="text-xl font-bold text-white mb-4">👁️ Live Preview</h3>
                <div className="bg-white rounded-lg p-6 min-h-[600px] text-black overflow-y-auto">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{websiteContent.pageTitle}</h1>
                    <h2 className="text-xl text-blue-600 mb-4">{websiteContent.heroDescription}</h2>
                    <p className="text-gray-600 leading-relaxed">{websiteContent.metaDescription}</p>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Our Features</h3>
                    <div className="grid gap-4">
                      {websiteContent.features.map((feature, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-3">
                            <div className="text-2xl">{feature.icon}</div>
                            <div>
                              <h4 className="font-bold text-gray-800 mb-1">{feature.title}</h4>
                              <p className="text-gray-600 text-sm">{feature.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Us</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>📞 Phone:</strong> {websiteContent.contactInfo.phone}</div>
                      <div><strong>✉️ Email:</strong> {websiteContent.contactInfo.email}</div>
                      <div><strong>📍 Address:</strong> {websiteContent.contactInfo.address}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "campaigns" && (
          <div className="admin-section">
            <div className="admin-card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-6">
                <h2 className="mobile-heading sm:text-2xl font-bold text-white">Campaigns</h2>
                <div className="text-xs sm:text-sm text-gray-400">
                  {campaigns.length} total campaigns
                </div>
              </div>

            {campaignsLoading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xl">Loading campaigns...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Campaign Requests</h3>
                <p className="text-gray-400">Campaign submissions will appear here for approval.</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="admin-card mobile-compact sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-white">{campaign.title}</h3>
                        <p className="text-sm text-gray-300">Campaign #{campaign.id}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border self-start ${getStatusColor(campaign.status)}`}>
                        {campaign.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Basic Information - Mobile Responsive */}
                    <div className="mobile-grid gap-2 sm:gap-4 mb-4 sm:mb-6">
                      <div className="admin-card p-2 sm:p-3">
                        <div className="mobile-text text-gray-400">Total Quantity</div>
                        <div className="text-white font-medium text-sm sm:text-base">{campaign.quantity} bottles</div>
                      </div>
                      <div className="admin-card p-2 sm:p-3">
                        <div className="mobile-text text-gray-400">Total Price</div>
                        <div className="text-white font-medium text-sm sm:text-base">₹{campaign.totalPrice}</div>
                      </div>
                      <div className="admin-card p-2 sm:p-3">
                        <div className="mobile-text text-gray-400">Submitted</div>
                        <div className="text-white font-medium text-sm sm:text-base">
                          {new Date(campaign.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Design Selection Information */}
                    <div className="bg-blue-900/30 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-blue-500/30">
                      <h4 className="text-sm font-semibold text-blue-300 mb-3">🎨 Design Selection Details:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                          <div className="text-xs text-blue-200 mb-1">Selected Design</div>
                          <div className="text-blue-100 text-sm">
                            {campaign.designType === 'gallery_selected' && campaign.selectedDesignTitle ? (
                              <span className="text-green-400">🎨 Gallery: {campaign.selectedDesignTitle}</span>
                            ) : campaign.designType === 'user_uploaded' && campaign.uploadedDesignFileName ? (
                              <span className="text-blue-400">📁 Uploaded: {campaign.uploadedDesignFileName}</span>
                            ) : campaign.designUrl ? (
                              <span className="text-yellow-400">🖼️ Custom Design File</span>
                            ) : (
                              <span className="text-gray-400">❌ No design selected</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-200 mb-1">Design Type</div>
                          <div className="text-blue-100 text-sm">
                            {campaign.designType || 'Not specified'}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Bottle Selection Details */}
                    <div className="bg-green-900/30 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-green-500/30">
                      <h4 className="text-sm font-semibold text-green-300 mb-3">🍶 Bottle Selection Details:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                          <div className="text-xs text-green-200 mb-1">Bottle Type</div>
                          <div className="text-green-100 text-sm font-medium">
                            {campaign.bottleSelectionType === 'mixed' ? 'Mixed Selection' : 
                             campaign.bottleType ? `${campaign.bottleType} Size` : 'Single Type'}
                          </div>
                        </div>
                        {campaign.bottle750mlQty && (
                          <div>
                            <div className="text-xs text-green-200 mb-1">750ml Bottles</div>
                            <div className="text-green-100 text-sm font-medium">{campaign.bottle750mlQty} bottles</div>
                          </div>
                        )}
                        {campaign.bottle1LQty && (
                          <div>
                            <div className="text-xs text-green-200 mb-1">1L Bottles</div>
                            <div className="text-green-100 text-sm font-medium">{campaign.bottle1LQty} bottles</div>
                          </div>
                        )}
                        {!campaign.bottle750mlQty && !campaign.bottle1LQty && campaign.bottleType && (
                          <div>
                            <div className="text-xs text-green-200 mb-1">Selected Size</div>
                            <div className="text-green-100 text-sm font-medium">{campaign.bottleType} Size</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery & Distribution Options */}
                    <div className="bg-orange-900/30 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-orange-500/30">
                      <h4 className="text-sm font-semibold text-orange-300 mb-3">🚚 Delivery & Distribution Details:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <div className="text-xs text-orange-200 mb-1">Distribution Option</div>
                          <div className="text-orange-100 text-sm">
                            {campaign.distributionOption === 'inStores' ? '🏪 In Stores Only' :
                             campaign.distributionOption === 'atYourLocation' ? '🏠 At Your Location' :
                             campaign.distributionOption === 'split' ? '🔄 Split Distribution' :
                             '❓ Not specified'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-orange-200 mb-1">Location</div>
                          <div className="text-orange-100 text-sm">
                            {campaign.selectedCity && campaign.selectedArea ? 
                              `${campaign.selectedArea}, ${campaign.selectedCity}` :
                              campaign.selectedCity ? campaign.selectedCity : 
                              '❓ Not specified'}
                            {campaign.selectedState && (
                              <div className="text-xs text-orange-300">State: {campaign.selectedState}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Split Distribution Details */}
                      {campaign.distributionOption === 'split' && (campaign.storesQuantity || campaign.homeQuantity) && (
                        <div className="mt-3 pt-3 border-t border-orange-500/20">
                          <div className="text-xs text-orange-200 mb-2">Split Distribution Breakdown:</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {campaign.storesQuantity && (
                              <div>
                                <div className="text-xs text-orange-300">For Stores</div>
                                <div className="text-orange-100 font-medium">{campaign.storesQuantity} bottles</div>
                              </div>
                            )}
                            {campaign.homeQuantity && (
                              <div>
                                <div className="text-xs text-orange-300">For Home Delivery</div>
                                <div className="text-orange-100 font-medium">{campaign.homeQuantity} bottles</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Full Address for Home Delivery */}
                      {campaign.deliveryAddress && (
                        <div className="mt-3 pt-3 border-t border-orange-500/20">
                          <div className="text-xs text-orange-200 mb-1">Delivery Address:</div>
                          <div className="text-orange-100 text-sm">{campaign.deliveryAddress}</div>
                        </div>
                      )}
                    </div>

                    {/* Pricing Breakdown */}
                    {(campaign.pricePerBottle || campaign.discountAmount || campaign.subtotal) && (
                      <div className="bg-purple-900/30 rounded-lg p-4 mb-4 border border-purple-500/30">
                        <h4 className="text-sm font-semibold text-purple-300 mb-3">💰 Pricing Breakdown:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {campaign.pricePerBottle && (
                            <div>
                              <div className="text-xs text-purple-200 mb-1">Price Per Bottle</div>
                              <div className="text-purple-100 text-sm font-medium">₹{campaign.pricePerBottle}</div>
                            </div>
                          )}
                          {campaign.subtotal && (
                            <div>
                              <div className="text-xs text-purple-200 mb-1">Subtotal</div>
                              <div className="text-purple-100 text-sm font-medium">₹{campaign.subtotal}</div>
                            </div>
                          )}
                          {campaign.discountAmount && (
                            <div>
                              <div className="text-xs text-purple-200 mb-1">Discount Applied</div>
                              <div className="text-green-400 text-sm font-medium">-₹{campaign.discountAmount}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* User Description Section - Always show if available */}
                    {campaign.description ? (
                      <div className="bg-purple-900/30 rounded-lg p-4 mb-4 border border-purple-500/30">
                        <h4 className="text-sm font-semibold text-purple-300 mb-2">📝 User Description:</h4>
                        <p className="text-purple-100 text-sm leading-relaxed">{campaign.description}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-600/30">
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">📝 User Description:</h4>
                        <p className="text-gray-500 text-sm italic">No description provided by user</p>
                      </div>
                    )}

                    {campaign.requirements && (
                      <div className="bg-black/20 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-semibold text-white mb-2">Requirements:</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{campaign.requirements}</p>
                      </div>
                    )}

                    {campaign.designUrl && (
                      <div className="mb-3 sm:mb-4">
                        <div className="text-sm text-gray-400 mb-2">Design File:</div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <a 
                            href={campaign.designUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            <span>View Design</span>
                          </a>
                          <button
                            onClick={() => handleDownloadDesign(campaign)}
                            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>Download Original</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3">
                      <button
                        onClick={() => openCampaignModal(campaign)}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        <span>Manage Campaign</span>
                      </button>
                      
                      {campaign.status === 'pending' && campaign.designUrl && (
                        <button
                          onClick={() => openReuploadModal(campaign)}
                          className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                          </svg>
                          <span>Request Design Reupload</span>
                        </button>
                      )}
                    </div>

                    {campaign.adminNotes && (
                      <div className="mt-4 bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                        <div className="text-sm font-semibold text-blue-300 mb-1">Admin Notes:</div>
                        <div className="text-blue-200 text-sm">{campaign.adminNotes}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-4">
            <div className="text-6xl">📋</div>
            <div className="text-center max-w-md">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Order Tracking Moved</h2>
              <p className="text-gray-400 mb-4 text-sm sm:text-base">All order tracking functionality is now available in the Campaign Requests tab</p>
              <button
                onClick={() => setActiveTab("campaigns")}
                className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Go to Campaign Requests
              </button>
            </div>
          </div>
        )}

        {activeTab === "logo-manager" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Logo Management</h2>
              <div className="text-sm text-gray-400">
                {logoSettings.length} logos uploaded
              </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white/10 rounded-xl p-4 sm:p-6 border border-white/20 glass-effect">
              <h3 className="text-xl font-bold text-white mb-4">🖼️ Upload New Logo</h3>
              

              
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Select Logo File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) {
                        setLogoFile(null);
                        return;
                      }
                      

                      
                      toast({
                        title: "Logo File Selected",
                        description: `${file.name} ready for upload`,
                      });
                      setLogoFile(file);
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 text-white border border-white/20 focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer"
                  />
                </div>
                {logoFile && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="text-sm text-gray-300 flex-1">
                      Selected: {logoFile.name}
                    </div>
                    <button
                      onClick={async () => {
                        if (!logoFile) {
                          toast({
                            title: "Upload Error",
                            description: "Please select a logo file first",
                            variant: "destructive",
                          });
                          return;
                        }
                        

                        setUploadingLogo(true);
                        const formData = new FormData();
                        formData.append('logo', logoFile);
                        await uploadLogoMutation.mutateAsync(formData);
                      }}
                      disabled={uploadingLogo}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {uploadingLogo ? "Uploading..." : "Upload Logo"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Current Logos */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Current Logos</h3>
              {logoSettingsLoading ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-xl">Loading logos...</p>
                </div>
              ) : logoSettings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🖼️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Logos Uploaded</h3>
                  <p className="text-gray-400">Upload your first logo to get started.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6">
                  {logoSettings.map((logo) => (
                    <div key={logo.id} className="bg-white/10 rounded-xl p-4 sm:p-6 border border-white/20 glass-effect">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                          <img 
                            src={logo.logoUrl} 
                            alt={logo.logoName}
                            className="w-20 h-20 object-contain bg-white/10 rounded-lg p-2"
                          />
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                          <h4 className="text-lg font-semibold text-white">{logo.logoName}</h4>
                          <p className="text-sm text-gray-400">
                            Uploaded: {new Date(logo.uploadedAt).toLocaleDateString('en-IN')}
                          </p>
                          {logo.isActive && (
                            <div className="inline-flex items-center mt-2 px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                              ✅ Active Logo
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          {!logo.isActive && (
                            <button
                              onClick={() => activateLogoMutation.mutate(logo.id)}
                              className="w-full sm:w-auto px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this logo?')) {
                                deleteLogoMutation.mutate(logo.id);
                              }
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "contacts" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold">Contact Messages</h2>
              <div className="text-sm text-gray-400">
                {contacts.length} total messages
              </div>
            </div>

            {contactsLoading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xl">Loading contacts...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📞</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Messages Yet</h3>
                <p className="text-gray-400">Contact submissions will appear here once customers reach out.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6">
                {contacts.map((contact) => (
                  <div key={contact.id} className="bg-white/10 rounded-xl p-4 sm:p-6 border border-white/20 glass-effect">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-white">{contact.name}</h3>
                        {contact.company && (
                          <p className="text-sm text-gray-300">{contact.company}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 self-start">
                        {new Date(contact.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span className="text-sm text-gray-300">{contact.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <span className="text-sm text-gray-300">{contact.phone}</span>
                      </div>
                    </div>

                    <div className="bg-black/20 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Message:</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{contact.message}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3">
                      <a
                        href={`mailto:${contact.email}`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        Send Email
                      </a>
                      <a
                        href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.108"/>
                        </svg>
                        WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold">Users Management</h2>
              <div className="text-sm text-gray-400">
                {users.filter(user => user.username !== 'admin').length} total users
              </div>
            </div>

            {usersLoading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xl">Loading users...</p>
              </div>
            ) : users.filter(user => user.username !== 'admin').length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Users Yet</h3>
                <p className="text-gray-400">User registrations will appear here once people sign up.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {users.filter(user => user.username !== 'admin').map((user) => {
                  const profile = userProfiles.find(p => p.userId === user.id);
                  const userLogs = activityLogs.filter(log => log.userId === user.id);
                  const lastActivity = userLogs.length > 0 ? new Date(userLogs[0].createdAt).toLocaleDateString() : 'No activity';
                  
                  return (
                    <div key={user.id} className="bg-white/10 rounded-xl p-6 border border-white/20 glass-effect">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {profile?.fullName || user.username}
                            </h3>
                            <p className="text-sm text-gray-300">@{user.username}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">User ID: {user.id}</div>
                          <div className="text-sm text-gray-400">Last Activity: {lastActivity}</div>
                        </div>
                      </div>

                      {profile && (
                        <div className="space-y-4 mb-4">
                          {/* Complete User Profile Information */}
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">Complete Profile Details:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <div className="text-xs text-gray-400">Full Name</div>
                                <div className="text-white text-sm font-medium">{profile.fullName || 'Not provided'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">Email Address</div>
                                <div className="text-white text-sm font-medium">{user.email || 'Not provided'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">Phone Number</div>
                                <div className="text-white text-sm font-medium">{profile.phone || 'Not provided'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">Company/Business</div>
                                <div className="text-white text-sm font-medium">{profile.company || 'Not provided'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">Complete Address</div>
                                <div className="text-white text-sm font-medium">{profile.address || 'Not provided'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">City</div>
                                <div className="text-white text-sm font-medium">{profile.city || 'Not provided'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">State</div>
                                <div className="text-white text-sm font-medium">{profile.state || 'Not provided'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">Pincode</div>
                                <div className="text-white text-sm font-medium">{profile.pincode || 'Not provided'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">Email Verification</div>
                                <div className={`text-sm font-medium ${user.isEmailVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                                  {user.isEmailVerified ? 'Verified' : 'Unverified'}
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Primary Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {profile.phone && (
                              <div>
                                <div className="text-sm text-gray-400">Mobile</div>
                                <div className="text-white text-sm font-medium">{profile.phone}</div>
                              </div>
                            )}
                            {profile.company && (
                              <div>
                                <div className="text-sm text-gray-400">Company</div>
                                <div className="text-white text-sm font-medium">{profile.company}</div>
                              </div>
                            )}
                          {profile.city && (
                            <div>
                              <div className="text-sm text-gray-400">Location</div>
                              <div className="text-white text-sm">{profile.city}, {profile.state}</div>
                            </div>
                          )}
                          {profile.pincode && (
                            <div>
                              <div className="text-sm text-gray-400">Pin Code</div>
                              <div className="text-white text-sm">{profile.pincode}</div>
                            </div>
                          )}
                          <div>
                            <div className="text-sm text-gray-400">Account Status</div>
                            <div className={`text-sm font-medium ${user.isBanned ? 'text-red-400' : user.isEmailVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                              {user.isBanned ? 'Banned' : user.isEmailVerified ? 'Verified' : 'Active'}
                            </div>
                          </div>
                          </div>
                          
                          {/* Address Section */}
                          {profile.address && (
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <div className="text-sm text-gray-400 mb-2 font-medium">Full Address:</div>
                              <div className="text-white text-sm">
                                {profile.address}
                                {profile.city && `, ${profile.city}`}
                                {profile.state && `, ${profile.state}`}
                                {profile.pincode && ` - ${profile.pincode}`}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-400">
                            Activity Logs: <span className="text-white font-medium">{userLogs.length}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            Joined: <span className="text-white font-medium">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                          {user.isBanned && (
                            <div className="text-sm">
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                                BANNED
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setActiveTab('activity')}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-sm font-medium transition-colors"
                          >
                            View Activity
                          </button>
                          
                          {user.isBanned ? (
                            <button
                              onClick={async () => {
                                if (confirm(`Are you sure you want to unban user "${user.username}"?`)) {
                                  try {
                                    const response = await fetch(`/api/users/${user.id}/ban`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ banned: false })
                                    });
                                    if (response.ok) {
                                      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
                                    }
                                  } catch (error) {
                                    console.error('Error unbanning user:', error);
                                  }
                                }
                              }}
                              className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded text-sm font-medium transition-colors"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                const banReason = prompt(`Enter reason for banning user "${user.username}":`);
                                if (banReason && banReason.trim()) {
                                  try {
                                    const response = await fetch(`/api/users/${user.id}/ban`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ banned: true, banReason: banReason.trim() })
                                    });
                                    if (response.ok) {
                                      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
                                    }
                                  } catch (error) {
                                    console.error('Error banning user:', error);
                                  }
                                }
                              }}
                              className="px-3 py-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded text-sm font-medium transition-colors"
                            >
                              Ban User
                            </button>
                          )}
                          
                          <button
                            onClick={async () => {
                              if (confirm(`⚠️ DANGER: Are you sure you want to permanently delete user "${user.username}" and all their data? This action cannot be undone!`)) {
                                if (confirm('This will delete the user account, profile, and all activity logs. Type "DELETE" to confirm:') && 
                                    prompt('Type "DELETE" to confirm:') === 'DELETE') {
                                  try {
                                    const response = await fetch(`/api/users/${user.id}`, {
                                      method: 'DELETE'
                                    });
                                    if (response.ok) {
                                      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
                                      queryClient.invalidateQueries({ queryKey: ['/api/user-profiles'] });
                                      queryClient.invalidateQueries({ queryKey: ['/api/activity-logs'] });
                                    }
                                  } catch (error) {
                                    console.error('Error deleting user:', error);
                                  }
                                }
                              }
                            }}
                            className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      {user.isBanned && user.banReason && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="text-sm text-red-400 font-medium mb-1">Ban Reason:</div>
                          <div className="text-sm text-gray-300">{user.banReason}</div>
                          {user.bannedAt && (
                            <div className="text-xs text-gray-500 mt-2">
                              Banned on: {new Date(user.bannedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Activity Logs</h2>
              <div className="text-sm text-gray-400">
                {activityLogs.filter(log => {
                  const user = users.find(u => u.id === log.userId);
                  return user && user.username !== 'admin';
                }).length} total activities
              </div>
            </div>

            {logsLoading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xl">Loading activity logs...</p>
              </div>
            ) : activityLogs.filter(log => {
              const user = users.find(u => u.id === log.userId);
              return user && user.username !== 'admin';
            }).length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Activity Logs</h3>
                <p className="text-gray-400">User activities will be recorded here as they interact with the system.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activityLogs
                  .filter(log => {
                    const user = users.find(u => u.id === log.userId);
                    return user && user.username !== 'admin';
                  })
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((log) => {
                    const user = users.find(u => u.id === log.userId);
                    const profile = userProfiles.find(p => p.userId === log.userId);
                    
                    const getActivityIcon = (activity: string) => {
                      switch (activity.toLowerCase()) {
                        case 'login': return '🔐';
                        case 'campaign_created': return '📋';
                        case 'bottle_uploaded': return '🍼';
                        case 'profile_updated': return '👤';
                        case 'design_created': return '🎨';
                        default: return '📝';
                      }
                    };

                    const getActivityColor = (activity: string) => {
                      switch (activity.toLowerCase()) {
                        case 'login': return 'text-green-400 bg-green-500/20';
                        case 'campaign_created': return 'text-blue-400 bg-blue-500/20';
                        case 'bottle_uploaded': return 'text-purple-400 bg-purple-500/20';
                        case 'profile_updated': return 'text-yellow-400 bg-yellow-500/20';
                        case 'design_created': return 'text-pink-400 bg-pink-500/20';
                        default: return 'text-gray-400 bg-gray-500/20';
                      }
                    };

                    return (
                      <div key={log.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-start space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(log.action)}`}>
                            <span className="text-lg">{getActivityIcon(log.action)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <h4 className="text-white font-medium">
                                  {profile?.fullName || user?.username || 'Unknown User'}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(log.action)}`}>
                                  {log.action.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-400">
                                {new Date(log.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{log.details}</p>
                            {log.ipAddress && (
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>IP: {log.ipAddress}</span>
                                {log.userAgent && (
                                  <span>Device: {log.userAgent.split(' ')[0]}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Price Management</h2>
              <button
                onClick={() => {
                  setEditingPrice(null);
                  setModalPriceData({ pricePerBottle: 70, discountPercentage: 0 });
                  setShowPriceModal(true);
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                Add Price Range
              </button>
            </div>

            {pricesLoading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xl">Loading price settings...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {priceSettings.map((price) => (
                  <div key={price.id} className="bg-white/10 rounded-xl p-6 border border-white/20 glass-effect">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-bold text-white">{price.bottleType} Bottles</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            price.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          }`}>
                            {price.isActive ? "Active" : "Inactive"}
                          </span>
                          {price.discountPercentage && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                              {price.discountPercentage}% Discount
                            </span>
                          )}
                        </div>
                        
                        {price.description && (
                          <p className="text-gray-300 text-sm mb-3">{price.description}</p>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm text-gray-400">Quantity Range</div>
                            <div className="text-white font-medium">
                              {price.minQuantity.toLocaleString()} - {price.maxQuantity ? price.maxQuantity.toLocaleString() : "Unlimited"}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Base Price</div>
                            <div className="text-white font-medium">₹{parseFloat(price.pricePerBottle).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Effective Price</div>
                            <div className="text-green-400 font-medium">
                              ₹{price.discountPercentage 
                                ? (parseFloat(price.pricePerBottle) * (1 - parseFloat(price.discountPercentage) / 100)).toFixed(2)
                                : parseFloat(price.pricePerBottle).toFixed(2)
                              }
                            </div>
                          </div>
                        </div>
                        
                        {/* Price Examples */}
                        <div className="mt-4 bg-black/20 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-2">Cost Examples:</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            {[1000, 5000, 10000, 25000].map(qty => {
                              const baseTotal = qty * parseFloat(price.pricePerBottle);
                              const discountedTotal = price.discountPercentage 
                                ? baseTotal * (1 - parseFloat(price.discountPercentage) / 100)
                                : baseTotal;
                              return (
                                <div key={qty} className="text-center">
                                  <div className="text-gray-400">{qty.toLocaleString()} bottles</div>
                                  <div className="text-white font-medium">₹{discountedTotal.toLocaleString()}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingPrice(price);
                            setModalPriceData({
                              pricePerBottle: parseFloat(price.pricePerBottle),
                              discountPercentage: parseFloat(price.discountPercentage || "0")
                            });
                            setShowPriceModal(true);
                          }}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete the price setting for ${price.bottleType} bottles?`)) {
                              deletePriceMutation.mutate(price.id);
                            }
                          }}
                          className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            updatePriceMutation.mutate({
                              id: price.id,
                              updates: { isActive: !price.isActive }
                            });
                          }}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            price.isActive 
                              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                              : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          }`}
                        >
                          {price.isActive ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



        {activeTab === "bottles" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Bottle Samples Management</h2>
              <div className="flex items-center space-x-4">
                <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                  1L Bottle - Premium Label (₹80)
                </div>
                <label className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 font-medium">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Upload 1L Bottle
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBottleUpload}
                    disabled={uploadingBottle}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Homepage Preview Section */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20 glass-effect mb-6">
              <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Homepage Live Preview
              </h3>
              <p className="text-gray-300 mb-4">
                Here you can see how your uploaded 1L bottle will appear on the homepage:
              </p>
              
              <div className="bg-white/5 rounded-lg p-4 flex items-center justify-center">
                {/* Single 1L Bottle Preview - Matching Homepage */}
                <div className="text-center">
                  <div className="relative">
                    {bottleSamples.find(b => b.bottleType === '1L' && b.isActive) ? (
                      <div className="w-28 h-72 rounded-lg mx-auto shadow-xl border-2 border-blue-300 relative overflow-hidden">
                        <img 
                          src={bottleSamples.find(b => b.bottleType === '1L' && b.isActive)?.imageUrl} 
                          alt="1L Water Bottle"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-white font-semibold bg-black/70 px-2 py-1 rounded">
                          1L
                        </div>
                      </div>
                    ) : (
                      <div className="w-28 h-72 bg-gradient-to-b from-blue-200 to-blue-50 rounded-full mx-auto shadow-xl border-2 border-blue-300 relative flex items-center justify-center">
                        <div className="text-center text-blue-600">
                          <div className="text-xs font-bold mb-1">1L</div>
                          <div className="text-[8px]">Large Label</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="text-sm font-bold text-blue-400">1L Bottle</div>
                    <div className="text-xs text-gray-400">₹80 per bottle</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400 mb-2">
                  When you upload PNG files, they will automatically replace the 1L bottle on the homepage
                </p>

              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-6 border border-white/20 glass-effect">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Upload Bottle Images
                </h3>
                <p className="text-gray-300 mb-2">
                  Upload PNG files to change the 1L bottle displayed on homepage
                </p>
                <div className="text-sm text-gray-400">
                  <strong>Current selection:</strong> 1L Premium Bottle (₹80)
                </div>
              </div>

              {/* Step by Step Instructions */}
              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 mb-6 border border-green-500/20">
                <h4 className="text-lg font-bold text-green-300 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  How to Update Homepage Bottles
                </h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start space-x-3">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                    <p><strong>Select Bottle Type:</strong> 1L Premium bottle is now the standard size</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                    <p><strong>Upload PNG File:</strong> Click "Upload" button to select your bottle image</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                    <p><strong>Auto Update:</strong> Homepage will automatically update after upload</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                    <p><strong>Manage:</strong> Activate/deactivate or delete uploaded bottles below</p>
                  </div>
                </div>
              </div>

              {bottlesLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  <p className="text-gray-300 mt-2">Loading bottle samples...</p>
                </div>
              ) : bottleSamples.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🍼</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Bottle Samples Uploaded</h3>
                  <p className="text-gray-400 mb-4">
                    No custom bottle samples have been uploaded yet.<br/>
                    Default promotional bottles are showing on homepage.
                  </p>
                  <p className="text-sm text-gray-500">
                    Use the "Upload" button above to upload your custom bottle images
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bottleSamples.map((bottle: any) => (
                    <div key={bottle.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-800">
                        <img
                          src={bottle.imageUrl}
                          alt={`${bottle.bottleType} Bottle Sample`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-white">
                            {bottle.bottleType} Size
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            bottle.isActive 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {bottle.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-400">
                          Price: ₹{bottle.bottleType === 'A4' ? '80' : '70'}
                        </div>
                        
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => handleToggleBottleStatus(bottle.id, bottle.isActive)}
                            className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                              bottle.isActive
                                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            }`}
                          >
                            {bottle.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteBottle(bottle.id)}
                            className="flex-1 px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {uploadingBottle && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4"></div>
                    <p className="text-white">Uploading {selectedBottleType} bottle sample...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Design Samples Management Tab */}
        {activeTab === "design-samples" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Design Samples Management</h2>
              <button
                onClick={() => {
                  setShowDesignSampleModal(true);
                  setSelectedDesignFile(null);
                  setDesignSampleData({ title: '', description: '', category: 'business', isActive: true });
                  setEditingDesignSample(null);
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                data-testid="button-add-design-sample"
              >
                <span>🎨</span>
                <span>Add Design Sample</span>
              </button>
            </div>



            {designSamplesLoading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xl">Loading design samples...</p>
              </div>
            ) : designSamples.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🎨</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Design Samples</h3>
                <p className="text-gray-400 mb-4">
                  Upload promotional design samples for users to view on the homepage.
                </p>
                <p className="text-sm text-gray-500">
                  Use the "Add Design Sample" button above to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {designSamples.map((sample) => (
                  <div 
                    key={sample.id} 
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-pink-300/50 transition-all duration-300"
                    data-testid={`card-design-sample-${sample.id}`}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-800">
                      <img
                        src={sample.imageUrl}
                        alt={sample.title}
                        className="w-full h-full object-cover"
                        data-testid={`img-design-sample-${sample.id}`}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-bold text-white text-sm mb-1" data-testid={`text-title-${sample.id}`}>
                          {sample.title}
                        </h4>
                        {sample.description && (
                          <p className="text-xs text-gray-400" data-testid={`text-description-${sample.id}`}>
                            {sample.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded font-medium">
                          {sample.category}
                        </span>
                        <span className={`px-2 py-1 rounded font-medium ${
                          sample.isActive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {sample.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditDesignSample(sample)}
                          className="flex-1 px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-xs font-medium transition-colors"
                          data-testid={`button-edit-${sample.id}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleDesignSampleStatus(sample.id, sample.isActive)}
                          className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                            sample.isActive
                              ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}
                          data-testid={`button-toggle-${sample.id}`}
                        >
                          {sample.isActive ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => handleDeleteDesignSample(sample.id)}
                          className="flex-1 px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-medium transition-colors"
                          data-testid={`button-delete-${sample.id}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Design Sample Upload/Edit Modal */}
            {showDesignSampleModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 max-w-md w-full mx-4">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    {editingDesignSample ? 'Edit Design Sample' : 'Add Design Sample'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Title *</label>
                      <input
                        type="text"
                        value={designSampleData.title}
                        onChange={(e) => setDesignSampleData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Design sample title"
                        data-testid="input-design-title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Description</label>
                      <textarea
                        value={designSampleData.description}
                        onChange={(e) => setDesignSampleData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                        rows={3}
                        placeholder="Optional description"
                        data-testid="input-design-description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Category</label>
                      <select
                        value={designSampleData.category}
                        onChange={(e) => setDesignSampleData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        data-testid="select-design-category"
                      >
                        <option value="business">Business</option>
                        <option value="event">Event</option>
                        <option value="personal">Personal</option>
                        <option value="brand">Brand</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={designSampleData.isActive}
                        onChange={(e) => setDesignSampleData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-4 h-4 text-pink-600 bg-gray-800 border-gray-600 rounded focus:ring-pink-500"
                        data-testid="checkbox-design-active"
                      />
                      <label htmlFor="isActive" className="text-sm text-white">
                        Show on homepage
                      </label>
                    </div>

                    {!editingDesignSample && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Image *</label>
                        

                        
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDesignSampleFileSelect}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                          data-testid="input-design-image"
                        />
                        {selectedDesignFile && (
                          <p className="text-xs text-green-400 mt-1">
                            Selected: {selectedDesignFile.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Upload an image showing the design on a bottle
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => {
                        if (editingDesignSample) {
                          handleUpdateDesignSample();
                        } else {
                          handleDesignSampleUpload();
                        }
                      }}
                      disabled={uploadingDesignSample}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                      data-testid="button-save-design-sample"
                    >
                      {uploadingDesignSample ? 'Uploading...' : editingDesignSample ? 'Update' : 'Add Sample'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDesignSampleModal(false);
                        setEditingDesignSample(null);
                        setDesignSampleData({ title: '', description: '', category: 'business', isActive: true });
                      }}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                      data-testid="button-cancel-design-sample"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Revenue & Transactions Tab */}
        {activeTab === "revenue" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Revenue & Transaction History</h2>
              <div className="text-sm text-gray-400">
                {transactions.length} total transactions
              </div>
            </div>

            {/* Revenue Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">
                      ₹{Math.round(transactions.reduce((sum, t) => sum + (parseFloat(t.amount?.toString() || '0') || 0), 0)).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-3xl">💰</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">Completed Payments</p>
                    <p className="text-2xl font-bold text-white">
                      {transactions.filter(t => t.status === 'completed').length}
                    </p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">Pending Payments</p>
                    <p className="text-2xl font-bold text-white">
                      {transactions.filter(t => t.status === 'pending').length}
                    </p>
                  </div>
                  <div className="text-3xl">⏳</div>
                </div>
              </div>
            </div>

            {/* Transaction History Section */}
            <div className="bg-white/10 rounded-xl p-6 border border-white/20 glass-effect">
              <h3 className="text-xl font-bold text-white mb-4">📊 Recent Transactions</h3>


              
              {transactionsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-4">💳</div>
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="bg-black/20 rounded-lg p-4 border border-white/10">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-bold text-white">#{transaction.transactionId}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              transaction.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {transaction.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Amount:</span>
                              <span className="text-white ml-2 font-medium">₹{transaction.amount}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Method:</span>
                              <span className={`ml-2 ${transaction.paymentMethod?.includes('UPI') ? 'text-purple-400' : 'text-white'}`}>
                                {transaction.paymentMethod || 'Card Payment'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Date:</span>
                              <span className="text-white ml-2">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {transaction.customerDetails && (
                            <div className="mt-2 text-sm">
                              <span className="text-gray-400">Customer:</span>
                              <span className="text-white ml-2">{JSON.parse(transaction.customerDetails).name}</span>
                            </div>
                          )}
                          {transaction.upiId && (
                            <div className="mt-2 text-sm">
                              <span className="text-gray-400">UPI ID:</span>
                              <span className="text-purple-400 ml-2 font-mono">{transaction.upiId}</span>
                            </div>
                          )}
                          {transaction.upiTransactionId && (
                            <div className="mt-1 text-sm">
                              <span className="text-gray-400">UPI Ref:</span>
                              <span className="text-purple-300 ml-2 font-mono text-xs">{transaction.upiTransactionId}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <button
                            onClick={() => handleViewTransactionDetails(transaction)}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-xs font-medium transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Accounts Tab */}
        {activeTab === "payment-accounts" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Payment Accounts Management</h2>
              <button
                onClick={() => setShowPaymentAccountModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                + Add Account
              </button>
            </div>

            {/* Active Payment Accounts Overview */}
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm font-medium">Total Payment Accounts</p>
                  <p className="text-2xl font-bold text-white">{paymentAccounts.length}</p>
                </div>
                <div className="text-3xl">🏦</div>
              </div>
            </div>

            {/* Payment Accounts List */}
            <div className="bg-white/10 rounded-xl p-6 border border-white/20 glass-effect">
              <h3 className="text-xl font-bold text-white mb-4">💳 Your Business Accounts</h3>

              {paymentAccountsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Loading payment accounts...</p>
                </div>
              ) : paymentAccounts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-4">🏦</div>
                  <p>No payment accounts configured yet</p>
                  <p className="text-sm mt-2">Add your business bank accounts, UPI IDs, and wallets</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {paymentAccounts.map((account) => (
                    <div key={account.id} className="bg-black/20 rounded-lg p-4 border border-white/10">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-bold text-white">{account.accountName}</h4>
                            {account.isDefault && (
                              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Default
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              account.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {account.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Type:</span>
                              <span className="text-white ml-2">{account.accountType}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Account:</span>
                              <span className="text-white ml-2">****{account.accountNumber?.slice(-4)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Provider:</span>
                              <span className="text-white ml-2">{account.providerName}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Created:</span>
                              <span className="text-white ml-2">
                                {new Date(account.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!account.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAccount(account.id)}
                              className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-xs font-medium transition-colors"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAccount(account.id)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Gateways Tab */}
        {activeTab === "payment-gateways" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Payment Gateway Configuration</h2>
              <div className="text-sm text-gray-400">
                API Keys & Settings
              </div>
            </div>

            {/* Payment Gateway Configuration */}
            <PaymentGatewaySettings />
          </div>
        )}

        {/* Site Visitors Tab */}
        {activeTab === "site-visitors" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">👥 Site Visitors Tracking</h2>
              <div className="text-sm text-gray-400">
                Real-time visitor analytics
              </div>
            </div>

            {/* Visitor Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">Active Now</p>
                    <p className="text-3xl font-bold text-white">
                      {visitorStatsLoading ? "..." : visitorStats?.totalActiveVisitors || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🟢</span>
                  </div>
                </div>
                <p className="text-green-300 text-xs mt-2">Currently browsing</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">Today</p>
                    <p className="text-3xl font-bold text-white">
                      {visitorStatsLoading ? "..." : visitorStats?.totalVisitorsToday || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
                <p className="text-blue-300 text-xs mt-2">Unique visitors today</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-medium">This Week</p>
                    <p className="text-3xl font-bold text-white">
                      {visitorStatsLoading ? "..." : visitorStats?.totalVisitorsThisWeek || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
                <p className="text-purple-300 text-xs mt-2">Past 7 days</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-400 text-sm font-medium">This Month</p>
                    <p className="text-3xl font-bold text-white">
                      {visitorStatsLoading ? "..." : visitorStats?.totalVisitorsThisMonth || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                </div>
                <p className="text-orange-300 text-xs mt-2">Past 30 days</p>
              </div>
            </div>

            {/* Active Visitors List */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Active Visitors</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">Live</span>
                </div>
              </div>
              
              {activeVisitorsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading active visitors...</p>
                </div>
              ) : activeVisitors.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-gray-400">No active visitors right now</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeVisitors.map((visitor, index) => (
                    <div key={visitor.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">
                                {visitor.userId ? "Registered User" : "Anonymous Visitor"}
                              </span>
                              {visitor.userId && (
                                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                                  User ID: {visitor.userId}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm">
                              IP: {visitor.ipAddress} • Session: {visitor.sessionId?.slice(0, 8)}...
                            </p>
                            <p className="text-gray-400 text-sm">
                              Page: {visitor.pageUrl || "/"} 
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 text-sm font-medium">
                            {new Date(visitor.lastActivityAt).toLocaleTimeString()}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Last activity
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Email Configuration Tab */}
        {activeTab === "email" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Email Configuration</h2>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📧</div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">Gmail Email Setup</h3>
                  {emailConfig.gmailUser ? (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Configured
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Not Configured
                    </span>
                  )}
                </div>
                <p className="text-gray-300 mb-6">
                  Configure your Gmail account to send automated order confirmation emails
                </p>
                {/* Gmail Configuration Form */}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const emailConfig = {
                    gmailUser: formData.get('gmailUser') as string,
                    gmailPassword: formData.get('gmailPassword') as string,
                    fromName: formData.get('fromName') as string || 'IamBillBoard'
                  };

                  // Save to localStorage for persistence
                  localStorage.setItem('billboardwalker_email_config', JSON.stringify(emailConfig));
                  setEmailConfig(emailConfig); // Update state to show configured status
                  
                  // Test the email configuration
                  try {
                    const response = await apiRequest('POST', '/api/test-email', {
                      testEmail: emailConfig.gmailUser,
                      config: emailConfig
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                      alert('✅ Gmail setup saved and tested successfully! Emails are now configured and ready to send OTP verification emails.');
                    } else {
                      alert('⚠️ Gmail settings saved but test email failed. Please check your credentials.');
                    }
                  } catch (error) {
                    alert('⚠️ Gmail settings saved but couldn\'t test. Please verify your setup.');
                  }
                }} className="space-y-6 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Gmail Email Address *
                    </label>
                    <input
                      type="email"
                      name="gmailUser"
                      required
                      defaultValue={emailConfig.gmailUser}
                      placeholder="your-business@gmail.com"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Gmail App Password *
                    </label>
                    <input
                      type="password"
                      name="gmailPassword"
                      required
                      defaultValue={emailConfig.gmailPassword}
                      placeholder="Your Gmail app password"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Generate app password from Google Account security settings
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      From Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="fromName"
                      defaultValue={emailConfig.fromName}
                      placeholder="IamBillBoard"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Save & Test Gmail Setup
                  </button>
                </form>
              </div>

              <div className="mt-8 bg-blue-900 border border-blue-600 rounded-lg p-6">
                <h4 className="text-xl font-bold text-blue-200 mb-4">📋 Email Features</h4>
                <div className="grid md:grid-cols-2 gap-4 text-blue-100">
                  <div className="flex items-start space-x-3">
                    <div className="text-green-400 text-xl">✅</div>
                    <div>
                      <div className="font-semibold">Order Confirmation</div>
                      <div className="text-sm opacity-80">Automatic emails when orders are placed</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-green-400 text-xl">✅</div>
                    <div>
                      <div className="font-semibold">Status Updates</div>
                      <div className="text-sm opacity-80">Email notifications for approval, production, dispatch</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-green-400 text-xl">✅</div>
                    <div>
                      <div className="font-semibold">Professional Templates</div>
                      <div className="text-sm opacity-80">Beautifully designed HTML email templates</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-green-400 text-xl">✅</div>
                    <div>
                      <div className="font-semibold">Detailed Information</div>
                      <div className="text-sm opacity-80">Complete order details, timeline, and contact info</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-yellow-900 border border-yellow-600 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-200 mb-2">⚠️ Setup Required</h4>
                <p className="text-yellow-100 text-sm">
                  You need to configure your Gmail credentials before automated emails will work. 
                  Click the button above to complete the setup process.
                </p>
              </div>
            </div>

            {/* SMS Configuration Section */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📱</div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">SMS Notification Setup</h3>
                  {smsConfig.twilioAccountSid ? (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Configured
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Not Configured
                    </span>
                  )}
                </div>
                <p className="text-gray-300 mb-6">
                  Configure Twilio SMS service to send automated notifications to customers
                </p>
                
                {/* Twilio Configuration Form */}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const newSmsConfig = {
                    twilioAccountSid: formData.get('twilioAccountSid') as string,
                    twilioAuthToken: formData.get('twilioAuthToken') as string,
                    twilioFromNumber: formData.get('twilioFromNumber') as string,
                    isEnabled: true
                  };

                  // Save to localStorage for persistence
                  localStorage.setItem('billboardwalker_sms_config', JSON.stringify(newSmsConfig));
                  setSmsConfig(newSmsConfig);
                  
                  // Test the SMS configuration
                  try {
                    const response = await apiRequest('POST', '/api/test-sms', {
                      testNumber: formData.get('testNumber') as string,
                      config: newSmsConfig
                    });
                    
                    if (response.ok) {
                      alert('✅ SMS setup saved and tested successfully! SMS notifications are now configured and ready to send.');
                    } else {
                      alert('⚠️ SMS setup saved but test failed. Please check your Twilio credentials.');
                    }
                  } catch (error) {
                    console.error('SMS test error:', error);
                    alert('⚠️ SMS setup saved but test failed. Please verify your Twilio configuration.');
                  }
                }} className="space-y-6 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Twilio Account SID
                    </label>
                    <input
                      type="text"
                      name="twilioAccountSid"
                      defaultValue={smsConfig.twilioAccountSid}
                      placeholder="AC1234567890abcdef1234567890abcdef"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Twilio Auth Token
                    </label>
                    <input
                      type="password"
                      name="twilioAuthToken"
                      defaultValue={smsConfig.twilioAuthToken}
                      placeholder="Your Auth Token"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      From Number (with +91)
                    </label>
                    <input
                      type="tel"
                      name="twilioFromNumber"
                      defaultValue={smsConfig.twilioFromNumber}
                      placeholder="+91XXXXXXXXXX"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Test Number (for testing SMS)
                    </label>
                    <input
                      type="tel"
                      name="testNumber"
                      placeholder="+91XXXXXXXXXX"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <small className="text-gray-400">Optional: Enter your number to test SMS functionality</small>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/50 transition-all duration-200"
                  >
                    Save & Test SMS Configuration
                  </button>
                </form>
                
                {/* SMS Features Info */}
                <div className="mt-8 p-6 bg-gray-900/50 rounded-xl border border-gray-600">
                  <h4 className="text-lg font-semibold text-white mb-4">SMS Notification Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start space-x-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-gray-300">Welcome SMS on user registration</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-gray-300">Payment confirmation messages</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-gray-300">Campaign status updates</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-gray-300">Production progress notifications</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-gray-300">Order confirmation SMS</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-gray-300">Delivery status updates</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <h5 className="text-blue-300 font-semibold mb-2">🔗 Setup Instructions</h5>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                      <li>Sign up at <a href="https://www.twilio.com" target="_blank" className="text-blue-400 hover:underline">twilio.com</a></li>
                      <li>Get your Account SID and Auth Token from Twilio Console</li>
                      <li>Purchase a phone number from Twilio (supports Indian numbers)</li>
                      <li>Enter your credentials above and test the configuration</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Settings Tab */}
        {activeTab === "admin-settings" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Admin Settings</h2>
              <div className="text-sm text-gray-400">
                Administrator Panel Configuration
              </div>
            </div>

            {/* Password Change Section */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center py-4">
                <div className="text-6xl mb-4">⚙️</div>
                <div className="flex items-center justify-center mb-4">
                  <h3 className="text-2xl font-bold text-white">Change Admin Password</h3>
                </div>
                <p className="text-gray-300 mb-6">
                  Update your admin panel login password for enhanced security
                </p>
                
                {/* Password Change Form */}
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password / वर्तमान पासवर्ड
                    </label>
                    <input
                      type="password"
                      value={adminSettings.currentPassword}
                      onChange={(e) => setAdminSettings(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password / नया पासवर्ड
                    </label>
                    <input
                      type="password"
                      value={adminSettings.newPassword}
                      onChange={(e) => setAdminSettings(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      placeholder="Enter new password (minimum 6 characters)"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password / पासवर्ड की पुष्टि करें
                    </label>
                    <input
                      type="password"
                      value={adminSettings.confirmPassword}
                      onChange={(e) => setAdminSettings(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 focus:ring-4 focus:ring-red-500/50 transition-all duration-200 disabled:opacity-50"
                  >
                    {changingPassword ? 'Changing Password...' : 'Change Password / पासवर्ड बदलें'}
                  </button>
                </form>
                
                {/* Security Info */}
                <div className="mt-8 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30 text-left">
                  <h5 className="text-blue-300 font-semibold mb-2">🔒 Security Guidelines</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                    <li>Password must be at least 6 characters long</li>
                    <li>Use a strong combination of letters, numbers, and symbols</li>
                    <li>Don't share your admin credentials with anyone</li>
                    <li>Change password regularly for better security</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comprehensive Price Management Modal */}
        {showPriceModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingPrice ? "Edit Price Setting" : "Add New Price Range"}
                </h3>
                <button
                  onClick={() => {
                    setShowPriceModal(false);
                    setEditingPrice(null);
                  }}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const data = {
                    bottleType: formData.get("bottleType"),
                    minQuantity: parseInt(formData.get("minQuantity") as string),
                    maxQuantity: formData.get("maxQuantity") ? parseInt(formData.get("maxQuantity") as string) : null,
                    pricePerBottle: modalPriceData.pricePerBottle,
                    discountPercentage: modalPriceData.discountPercentage || null,
                    description: formData.get("description") || null,
                    isActive: formData.get("isActive") === "on",
                  };
                  savePriceMutation.mutate(data);
                }}
                className="space-y-6"
              >
                {/* Bottle Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bottle Type
                    </label>
                    <select
                      name="bottleType"
                      defaultValue={editingPrice?.bottleType || "750ml"}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="750ml">750ml Water Bottle</option>
                      <option value="1L">1L Water Bottle</option>
                      <option value="500ml">500ml Water Bottle</option>
                      <option value="2L">2L Water Bottle</option>
                      <option value="Custom">Custom Size</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price per Bottle (₹)
                    </label>
                    <input
                      type="number"
                      name="pricePerBottle"
                      step="0.01"
                      min="1"
                      value={modalPriceData.pricePerBottle || ""}
                      onChange={(e) => setModalPriceData(prev => ({
                        ...prev,
                        pricePerBottle: parseFloat(e.target.value) || 0
                      }))}
                      placeholder="Enter price in rupees"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Quantity Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minimum Quantity
                    </label>
                    <input
                      type="number"
                      name="minQuantity"
                      min="1"
                      defaultValue={editingPrice?.minQuantity || "1000"}
                      placeholder="e.g., 1000"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Quantity (Optional)
                    </label>
                    <input
                      type="number"
                      name="maxQuantity"
                      min="1"
                      defaultValue={editingPrice?.maxQuantity || ""}
                      placeholder="Leave empty for unlimited"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Discount and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bulk Discount % (Optional)
                    </label>
                    <input
                      type="number"
                      name="discountPercentage"
                      step="0.1"
                      min="0"
                      max="100"
                      value={modalPriceData.discountPercentage || ""}
                      onChange={(e) => setModalPriceData(prev => ({
                        ...prev,
                        discountPercentage: parseFloat(e.target.value) || 0
                      }))}
                      placeholder="e.g., 10.5"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 text-gray-300">
                      <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked={editingPrice?.isActive ?? true}
                        className="w-5 h-5 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">Active (Available for customers)</span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingPrice?.description || ""}
                    placeholder="e.g., Best value for large orders, Premium quality bottles..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Price Preview */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-lg border border-blue-500/30">
                  <h4 className="text-white font-semibold mb-2">Price Preview:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {[1000, 5000, 10000, 50000].map(qty => {
                      const baseTotal = qty * modalPriceData.pricePerBottle;
                      const discountedTotal = modalPriceData.discountPercentage 
                        ? baseTotal * (1 - modalPriceData.discountPercentage / 100)
                        : baseTotal;
                      return (
                        <div key={qty}>
                          <div className="text-gray-400">{qty.toLocaleString()} bottles</div>
                          <div className="text-white font-medium">₹{discountedTotal.toLocaleString()}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={savePriceMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-all"
                  >
                    {savePriceMutation.isPending ? "Saving..." : editingPrice ? "Update Price" : "Add Price Range"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPriceModal(false);
                      setEditingPrice(null);
                    }}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Account Modal */}
        {showPaymentAccountModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Add Payment Account</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const accountData = {
                  accountName: formData.get('accountName') as string,
                  accountType: formData.get('accountType') as string,
                  accountNumber: formData.get('accountNumber') as string,
                  providerName: formData.get('providerName') as string,
                  ifscCode: formData.get('ifscCode') as string,
                  isDefault: false,
                  status: 'active'
                };

                try {
                  await apiRequest('POST', '/api/payment-accounts', accountData);
                  queryClient.invalidateQueries({ queryKey: ['/api/payment-accounts'] });
                  setShowPaymentAccountModal(false);
                } catch (error) {
                  alert('Failed to add payment account');
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Account Name</label>
                  <input
                    type="text"
                    name="accountName"
                    required
                    placeholder="e.g., Main UPI Account"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Account Type</label>
                  <select
                    name="accountType"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="bank">Bank Account</option>
                    <option value="upi">UPI</option>
                    <option value="wallet">Digital Wallet</option>
                    <option value="card">Credit/Debit Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Account Number/UPI ID</label>
                  <input
                    type="text"
                    name="accountNumber"
                    required
                    placeholder="e.g., 1234567890 or user@paytm"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Provider</label>
                  <input
                    type="text"
                    name="providerName"
                    required
                    placeholder="e.g., SBI, PhonePe, Paytm"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">IFSC Code (if Bank Account)</label>
                  <input
                    type="text"
                    name="ifscCode"
                    placeholder="e.g., SBIN0001234 (for bank accounts)"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Add Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentAccountModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction Details Modal */}
        {showTransactionModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Transaction Details</h3>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Transaction ID</h4>
                    <p className="text-white font-medium">{selectedTransaction.transactionId}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Amount</h4>
                    <p className="text-white font-medium">₹{selectedTransaction.amount}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Payment Method</h4>
                    <p className="text-white">{selectedTransaction.paymentMethod}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Status</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedTransaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      selectedTransaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      selectedTransaction.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Date & Time</h4>
                    <p className="text-white">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedTransaction.customerDetails && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Customer Details</h4>
                      <div className="text-white text-sm">
                        {JSON.stringify(JSON.parse(selectedTransaction.customerDetails), null, 2)}
                      </div>
                    </div>
                  )}
                  {selectedTransaction.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Notes</h4>
                      <p className="text-white text-sm">{selectedTransaction.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Management Modal */}
        {showCampaignModal && selectedCampaign && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Campaign Management</h3>
                    <p className="text-gray-600 mt-1">Update status and manage campaign progress</p>
                  </div>
                  <button
                    onClick={() => setShowCampaignModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Campaign Details */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Campaign ID</p>
                      <p className="text-lg font-semibold text-gray-900">{`CAMP-${selectedCampaign.id}`}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedCampaign.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bottle Type</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedCampaign.bottleType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-lg font-semibold text-gray-900">₹{selectedCampaign.totalPrice}</p>
                    </div>
                  </div>
                  
                  {selectedCampaign.requirements && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Requirements</p>
                      <p className="text-gray-800 bg-white rounded-lg p-3 mt-1">{selectedCampaign.requirements}</p>
                    </div>
                  )}
                </div>

                {/* Status Management */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Update Campaign Status</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Status
                    </label>
                    <select
                      value={campaignStatus}
                      onChange={(e) => setCampaignStatus(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">Pending / Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="in_production">Production Started</option>
                      <option value="shipped">In Progress / Shipped</option>
                      <option value="delivered">Delivered to Stores</option>
                    </select>
                  </div>

                  {/* Rejection Reason (only show when status is rejected) */}
                  {campaignStatus === 'rejected' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Please provide a detailed reason for rejection..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        required={campaignStatus === 'rejected'}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        This reason will be displayed to the customer and may affect refund processing.
                      </p>
                    </div>
                  )}

                  {/* Production Stage Info */}
                  {['approved', 'in_production', 'shipped', 'delivered'].includes(campaignStatus) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h5 className="font-medium text-blue-900 mb-2">Production Stage Information</h5>
                      <div className="space-y-2 text-sm text-blue-800">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${campaignStatus === 'approved' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                          <span>Approved - Campaign ready for production</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${['in_production', 'shipped', 'delivered'].includes(campaignStatus) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>Production Started - Manufacturing in progress</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${['shipped', 'delivered'].includes(campaignStatus) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>In Progress - Quality check and shipping preparation</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${campaignStatus === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>Delivered to Stores - Campaign completed successfully</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    onClick={() => setShowCampaignModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCampaign}
                    disabled={updatingCampaign || (campaignStatus === 'rejected' && !rejectionReason.trim())}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {updatingCampaign ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Update Campaign</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Design Reupload Modal */}
      {showReuploadModal && reuploadCampaign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 w-full max-w-2xl border border-gray-600 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">🎨 Request Design Reupload</h3>
                <p className="text-gray-300">Campaign: {reuploadCampaign.title}</p>
              </div>
              <button
                onClick={() => setShowReuploadModal(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Feedback Section */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Design Feedback <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={reuploadFeedback}
                  onChange={(e) => setReuploadFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-black/30 text-white border border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
                  placeholder="Provide specific feedback about what needs to be improved in the design (e.g., image quality, text readability, branding issues, etc.)"
                />
                <p className="text-gray-400 text-sm mt-2">
                  This feedback will help the user understand exactly what needs to be fixed
                </p>
              </div>

              {/* Rejection Reason Section */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Rejection Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={reuploadReason}
                  onChange={(e) => setReuploadReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-black/30 text-white border border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
                  placeholder="Provide a clear reason for rejecting the design (e.g., does not meet quality standards, brand guidelines violation, etc.)"
                />
                <p className="text-gray-400 text-sm mt-2">
                  This will be included in the email notification to the user
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => setShowReuploadModal(false)}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestReupload}
                  disabled={!reuploadFeedback.trim() || !reuploadReason.trim() || requestReuploadMutation.isPending}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {requestReuploadMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                      </svg>
                      <span>Send Reupload Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// Export Admin component directly without authentication
export default Admin;
