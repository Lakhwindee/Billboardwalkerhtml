import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Link } from 'wouter';
import { Eye, Clock, CheckCircle2, XCircle, Package, AlertCircle, Truck, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { validateFile, formatFileSize, A3_INFO } from '@/lib/fileValidation';

// Campaign Tracking Component
function CampaignStudioContent() {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  // Fetch real campaign data from API
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['/api/campaigns'],
    retry: false,
  });

  // Use real campaign data or empty array if no data
  const campaignList: any[] = Array.isArray(campaigns) ? campaigns : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_production': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'in_production': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'in_production': return 'Production Started';
      case 'shipped': return 'In Progress';
      case 'delivered': return 'Delivered to Stores';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getProductionStage = (status: string) => {
    switch (status) {
      case 'approved': return { stage: 'Approved', progress: 25, color: 'green' };
      case 'in_production': return { stage: 'Production Started', progress: 50, color: 'blue' };
      case 'shipped': return { stage: 'In Progress', progress: 75, color: 'orange' };
      case 'delivered': return { stage: 'Delivered to Stores', progress: 100, color: 'green' };
      default: return { stage: 'Pending', progress: 0, color: 'gray' };
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Campaign Studio</h2>
          <p className="text-gray-600">Track your campaign status and production progress</p>
        </div>

        {/* Campaign Studio Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setSelectedTab('pending')}
              className={`px-6 py-4 font-medium ${
                selectedTab === 'pending'
                  ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Pending / Under Review
            </button>
            <button
              onClick={() => setSelectedTab('approved')}
              className={`px-6 py-4 font-medium ${
                selectedTab === 'approved'
                  ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 inline mr-2" />
              Approved
            </button>
            <button
              onClick={() => setSelectedTab('rejected')}
              className={`px-6 py-4 font-medium ${
                selectedTab === 'rejected'
                  ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <XCircle className="w-4 h-4 inline mr-2" />
              Rejected
            </button>
          </div>
        </div>

        {/* Campaign Studio Content */}
        {selectedTab === 'pending' && (
          <div className="space-y-6">
            {campaignList.filter(c => c.status === 'pending').length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No pending campaigns</h3>
                <p className="text-gray-500">Submit a new campaign to see it here under review</p>
                
                {/* Refund Policy Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <div className="text-3xl">💰</div>
                    <h4 className="text-lg font-semibold text-blue-900">Refund Policy</h4>
                  </div>
                  <p className="text-blue-800 text-sm max-w-md mx-auto">
                    If your campaign request is rejected by our team, you will receive a full refund within 1-6 business days to your original payment method.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {campaignList.filter(c => c.status === 'pending').map((campaign) => (
                  <div key={campaign.id} className="bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCampaign(campaign)}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{campaign.campaignId}</h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(campaign.status)}`}>
                              {getStatusIcon(campaign.status)}
                              <span>{formatStatus(campaign.status)}</span>
                            </div>
                          </div>
                          <p className="text-gray-600">Customer: {campaign.customerName}</p>
                          <p className="text-gray-500 text-sm mt-1">Submitted: {new Date(campaign.submittedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">₹{campaign.totalAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{campaign.paymentMethod}</p>
                        </div>
                      </div>
                      
                      {/* Production Stage Indicator */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">Status: Under Review</p>
                          <p className="text-xs text-gray-500">Awaiting approval</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'approved' && (
          <div className="space-y-6">
            {campaignList.filter(c => ['approved', 'in_production', 'shipped', 'delivered'].includes(c.status)).length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No approved campaigns</h3>
                <p className="text-gray-500">Approved campaigns will appear here with production stage tracking</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {campaignList.filter(c => ['approved', 'in_production', 'shipped', 'delivered'].includes(c.status)).map((campaign) => {
                  const productionStage = getProductionStage(campaign.status);
                  return (
                    <div key={campaign.id} className="bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCampaign(campaign)}>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{campaign.campaignId}</h3>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(campaign.status)}`}>
                                {getStatusIcon(campaign.status)}
                                <span>{formatStatus(campaign.status)}</span>
                              </div>
                            </div>
                            <p className="text-gray-600">Customer: {campaign.customerName}</p>
                            <p className="text-gray-500 text-sm mt-1">Approved: {new Date(campaign.submittedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">₹{campaign.totalAmount.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">{campaign.paymentMethod}</p>
                          </div>
                        </div>
                        
                        {/* Production Stage Indicator */}
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-700">Production Stage: {productionStage.stage}</p>
                            <p className="text-xs text-gray-500">{productionStage.progress}% Complete</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                productionStage.color === 'green' ? 'bg-green-500' :
                                productionStage.color === 'blue' ? 'bg-blue-500' :
                                productionStage.color === 'orange' ? 'bg-orange-500' :
                                'bg-gray-500'
                              }`}
                              style={{ width: `${productionStage.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Approved</span>
                            <span>Production</span>
                            <span>Progress</span>
                            <span>Delivered</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'rejected' && (
          <div className="space-y-6">
            {campaignList.filter(c => c.status === 'rejected').length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No rejected campaigns</h3>
                <p className="text-gray-500">Rejected campaigns will appear here with rejection reasons</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {campaignList.filter(c => c.status === 'rejected').map((campaign) => (
                  <div key={campaign.id} className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCampaign(campaign)}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{campaign.campaignId}</h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(campaign.status)}`}>
                              {getStatusIcon(campaign.status)}
                              <span>{formatStatus(campaign.status)}</span>
                            </div>
                          </div>
                          <p className="text-gray-600">Customer: {campaign.customerName}</p>
                          <p className="text-gray-500 text-sm mt-1">Rejected: {new Date(campaign.submittedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">₹{campaign.totalAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{campaign.paymentMethod}</p>
                        </div>
                      </div>
                      
                      {/* Rejection Reason */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-start space-x-2">
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-900">Rejection Reason:</p>
                              <p className="text-sm text-red-800 mt-1">
                                {campaign.adminNotes || "Image quality does not meet our printing standards. Please submit a higher resolution design (minimum 300 DPI)."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Campaign Details Modal */}
        {selectedCampaign && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Campaign Details</h2>
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedCampaign.campaignId}</h3>
                    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedCampaign.status)}`}>
                      {getStatusIcon(selectedCampaign.status)}
                      <span>{formatStatus(selectedCampaign.status)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">₹{selectedCampaign.totalAmount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{selectedCampaign.paymentMethod}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Order Information</h4>
                    <div className="space-y-3 text-sm">
                      <div><span className="font-medium">Customer:</span> {selectedCampaign.customerName}</div>
                      <div><span className="font-medium">Bottle Type:</span> {selectedCampaign.bottleType}</div>
                      <div><span className="font-medium">Submitted:</span> {new Date(selectedCampaign.submittedAt).toLocaleDateString()}</div>
                      <div><span className="font-medium">Payment Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedCampaign.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {selectedCampaign.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refund Notice for Rejected Campaigns */}
                {selectedCampaign.status === 'rejected' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-xl">💰</div>
                      <div>
                        <h5 className="font-semibold text-orange-900 mb-1">Refund Processing</h5>
                        <p className="text-orange-800 text-sm">
                          Your campaign has been rejected. A full refund of ₹{selectedCampaign.totalAmount.toLocaleString()} will be processed within 1-6 business days to your original payment method ({selectedCampaign.paymentMethod}).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  // Dashboard state (authentication removed)
  
  // Dashboard tab state
  const [dashboardTab, setDashboardTab] = useState('design');
  // Campaign Studio sub-tab state
  const [campaignStudioTab, setCampaignStudioTab] = useState('pending');
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'upi'
  // Multi-step checkout states
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Customer Info, 2: Payment, 3: Confirmation
  
  // Customer checkout information
  const [checkoutCustomerInfo, setCheckoutCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    companyName: '' // Optional for business customers
  });
  const [campaignSubmitted, setCampaignSubmitted] = useState(false);
  const [campaignData, setCampaignData] = useState<any>(null);
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Campaign description state
  const [campaignDescription, setCampaignDescription] = useState('');
  
  // Distribution state
  const [selectedOption, setSelectedOption] = useState('inStores');
  const [splitQuantities, setSplitQuantities] = useState({
    stores: 500,
    yourLocation: 500,
  });
  
  // Price calculator state
  const [bottleSize, setBottleSize] = useState('750ml');
  const [quantity, setQuantity] = useState(1000);
  const [useMixedSelection, setUseMixedSelection] = useState(false);
  const [mixedBottles, setMixedBottles] = useState({
    '750ml': 500,
    '1L': 500
  });
  
  // Location state
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  // Split distribution location states
  const [splitStoreCity, setSplitStoreCity] = useState('');
  const [splitStoreArea, setSplitStoreArea] = useState('');

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [paymentValidationErrors, setPaymentValidationErrors] = useState<Record<string, boolean>>({});
  const [showPaymentValidation, setShowPaymentValidation] = useState(false);
  
  // Customer details for direct delivery
  const [customerDetails, setCustomerDetails] = useState({
    address: '',
    pincode: '',
    phone: '',
    splitAddress: ''  // for split delivery
  });

  // Payment form state
  const [paymentFormData, setPaymentFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    upiId: ''
  });
  
  // City and area data - Currently serving Chandigarh, Mohali, and Panchkula
  const cityAreaData: Record<string, string[]> = {
    'Chandigarh': [
      'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6', 'Sector 7', 'Sector 8', 'Sector 9', 'Sector 10',
      'Sector 11', 'Sector 12', 'Sector 14', 'Sector 15', 'Sector 16', 'Sector 17', 'Sector 18', 'Sector 19', 'Sector 20',
      'Sector 21', 'Sector 22', 'Sector 23', 'Sector 24', 'Sector 25', 'Sector 26', 'Sector 27', 'Sector 28', 'Sector 29', 'Sector 30',
      'Sector 31', 'Sector 32', 'Sector 33', 'Sector 34', 'Sector 35', 'Sector 36', 'Sector 37', 'Sector 38', 'Sector 39', 'Sector 40',
      'Sector 41', 'Sector 42', 'Sector 43', 'Sector 44', 'Sector 45', 'Sector 46', 'Sector 47', 'Sector 48', 'Sector 49', 'Sector 50',
      'Sector 51', 'Sector 52', 'Sector 53', 'Sector 54', 'Sector 55', 'Sector 56', 'Sector 57', 'Sector 58', 'Sector 59', 'Sector 60',
      'Sector 61', 'Sector 62', 'Sector 63', 'Industrial Area Phase 1', 'Industrial Area Phase 2', 'Manimajra', 'Burail', 'Maloya'
    ],
    'Mohali': [
      'Phase 1', 'Phase 2', 'Phase 3A', 'Phase 3B1', 'Phase 3B2', 'Phase 4', 'Phase 5', 'Phase 6', 'Phase 7',
      'Phase 8', 'Phase 9', 'Phase 10', 'Phase 11', 'Sector 68', 'Sector 69', 'Sector 70', 'Sector 71', 'Sector 72',
      'Sector 73', 'Sector 74', 'Sector 75', 'Sector 76', 'Sector 77', 'Sector 78', 'Sector 79', 'Sector 80',
      'Sector 81', 'Sector 82', 'Sector 83', 'Sector 84', 'Sector 85', 'Sector 86', 'Sector 87', 'Sector 88',
      'Industrial Area Phase 1', 'Industrial Area Phase 2', 'Kharar', 'Kurali', 'Banur', 'Dera Bassi', 'Zirakpur'
    ],
    'Panchkula': [
      'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6', 'Sector 7', 'Sector 8', 'Sector 9', 'Sector 10',
      'Sector 11', 'Sector 12', 'Sector 12A', 'Sector 13', 'Sector 14', 'Sector 15', 'Sector 16', 'Sector 17', 'Sector 18', 'Sector 19',
      'Sector 20', 'Sector 21', 'Sector 22', 'Sector 23', 'Sector 24', 'Sector 25', 'Sector 26', 'Sector 27', 'Sector 28',
      'Industrial Area Phase 1', 'Industrial Area Phase 2', 'Raipur Rani', 'Barwala', 'Kalka', 'Pinjore', 'Morni Hills'
    ]
  };

  // File upload handlers with A3 validation
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Validate file using A3 size restrictions
      const validationError = validateFile(file);
      if (validationError) {
        alert(`फ़ाइल अपलोड Error: ${validationError}`);
        return;
      }
      
      setUploadedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg']
    },
    maxFiles: 1,
    maxSize: 15728640 // 15MB (A3 size limit)
  });

  // Form validation function
  const validateAndProceedToPayment = () => {
    const errors: Record<string, boolean> = {};
    
    // Validate design upload
    if (!uploadedFile) {
      errors.design = true;
    }
    
    // Validate campaign description
    if (!campaignDescription.trim()) {
      errors.description = true;
    }
    
    // Validate location selection for all distribution options
    if (selectedOption === 'inStores') {
      if (!selectedCity || !selectedArea) {
        errors.location = true;
      }
    } else if (selectedOption === 'atYourLocation') {
      if (!selectedCity || !selectedArea || !customerDetails.address.trim() || !customerDetails.pincode.trim() || !customerDetails.phone.trim()) {
        errors.address = true;
      }
    } else if (selectedOption === 'split') {
      if (!splitStoreCity || !splitStoreArea) {
        errors.splitLocation = true;
      }
      if (!customerDetails.splitAddress.trim()) {
        errors.splitAddress = true;
      }
    }
    
    // Validate quantity (minimum 1000 bottles)
    const totalQuantity = useMixedSelection 
      ? (mixedBottles['750ml'] + mixedBottles['1L']) 
      : quantity;
    
    if (totalQuantity < 1000) {
      errors.quantity = true;
    }
    
    // Set form errors and show validation
    setFormErrors(errors);
    setShowValidationErrors(true);
    
    // If no errors, proceed to checkout page
    if (Object.keys(errors).length === 0) {
      // Save checkout data to localStorage
      const checkoutData = {
        quantity: useMixedSelection ? (mixedBottles['750ml'] + mixedBottles['1L']) : quantity,
        bottleSize: useMixedSelection ? 'Mixed' : bottleSize,
        description: campaignDescription,
        useMixedSelection,
        mixedBottles,
        selectedOption,
        selectedCity,
        selectedArea,
        uploadedFile: uploadedFile ? {
          name: uploadedFile.name,
          size: uploadedFile.size
        } : null,
        totalAmount: useMixedSelection ? 
          ((mixedBottles['750ml'] * 70) + (mixedBottles['1L'] * 80)) :
          (quantity * (bottleSize === '750ml' ? 70 : 80))
      };
      
      localStorage.setItem('billboardwalker_checkout_data', JSON.stringify(checkoutData));
      
      // Navigate to checkout page
      window.location.href = '/checkout';
      
      setShowValidationErrors(false);
    } else {
      // Scroll to validation error summary
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Payment validation function
  const validatePaymentAndProceed = () => {
    const errors: Record<string, boolean> = {};
    
    if (paymentMethod === 'card') {
      if (!paymentFormData.cardNumber.trim()) errors.cardNumber = true;
      if (!paymentFormData.expiryDate.trim()) errors.expiryDate = true;
      if (!paymentFormData.cvv.trim()) errors.cvv = true;
      if (!paymentFormData.cardholderName.trim()) errors.cardholderName = true;
    } else if (paymentMethod === 'upi') {
      if (!paymentFormData.upiId.trim()) errors.upiId = true;
    }
    
    setPaymentValidationErrors(errors);
    setShowPaymentValidation(true);
    
    if (Object.keys(errors).length === 0) {
      // Process payment - move to final confirmation
      setCheckoutStep(3);
      setShowPaymentValidation(false);
    }
  };

  useEffect(() => {
    // Check URL parameters to set initial tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'campaigns') {
      setDashboardTab('studio'); // Campaign studio tab
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-cyan-100">
      {/* Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-white/50 sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center space-x-1.5 sm:space-x-3 cursor-pointer group">
                <div className="text-lg sm:text-2xl">📢</div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all truncate">
                    IamBillBoard
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Custom Bottle Advertising</p>
                </div>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              <Link href="/">
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  <span>Home</span>
                </button>
              </Link>
              

              
              <div className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium text-sm">
                Dashboard
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex sm:hidden items-center space-x-1">
              <Link href="/">
                <button className="p-1.5 text-gray-600 hover:text-gray-800 transition-colors" title="Home">
                  🏠
                </button>
              </Link>
              

              
              <div className="px-2 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-xs font-medium">
                Dashboard
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Dashboard Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              🎯 Campaign Dashboard
            </span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            Design your custom bottle advertising campaign with real-time pricing and distribution options
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/50">
            <div className="flex space-x-1">
              <button
                onClick={() => setDashboardTab('design')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all text-xs sm:text-sm ${
                  dashboardTab === 'design'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                🎨 Design Campaign
              </button>
              <button
                onClick={() => setDashboardTab('studio')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all text-xs sm:text-sm ${
                  dashboardTab === 'studio'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                📊 Campaign Studio
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Design Campaign Tab */}
          {dashboardTab === 'design' && (
            <div className="space-y-6">
              {/* File Upload Section */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/50 mb-4 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">📁 Upload Your Design</h3>
                
                {/* A3 Size Information */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20 mb-6">
                  <h4 className="text-md font-bold text-blue-800 mb-2 flex items-center">
                    📏 File Upload Requirements - A3 Paper Size
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="text-blue-700 font-medium mb-1">Maximum File Size</div>
                      <div className="text-gray-700">{A3_INFO.maxFileSize} (A3 Paper Standard)</div>
                      <div className="text-xs text-gray-600 mt-1">Dimensions: {A3_INFO.dimensions}</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="text-blue-700 font-medium mb-1">Recommended Sizes</div>
                      <div className="text-gray-700 text-xs space-y-1">
                        <div>JPEG: {A3_INFO.recommendedSizes.jpeg}</div>
                        <div>PNG: {A3_INFO.recommendedSizes.png}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div
                  {...getRootProps()}
                  className={`border-4 border-dashed rounded-2xl p-4 sm:p-6 lg:p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive 
                      ? 'border-pink-500 bg-pink-50' 
                      : uploadedFile 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 bg-gray-50 hover:border-pink-400 hover:bg-pink-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  
                  {uploadedFile ? (
                    <div className="space-y-4">
                      <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div>
                        <p className="text-lg font-semibold text-green-700">✓ File Uploaded!</p>
                        <p className="text-sm text-gray-600 mt-1" data-testid="text-uploaded-filename">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-500 mt-2">Size: {formatFileSize(uploadedFile.size)}</p>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                          }}
                          data-testid="button-remove-file"
                          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          🗑️ Remove File
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <svg className={`w-16 h-16 mx-auto ${showValidationErrors && formErrors.design ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <div>
                        <p className={`text-xl font-semibold ${showValidationErrors && formErrors.design ? 'text-red-700' : 'text-gray-700'}`}>📁 Upload Your Design</p>
                        <p className={`mt-2 ${showValidationErrors && formErrors.design ? 'text-red-500' : 'text-gray-500'}`}>Drag & drop your logo/design here, or click to browse</p>
                        <p className="text-xs text-gray-400 mt-1">Supports: JPG, PNG, SVG (Max: {A3_INFO.maxFileSize} - A3 Size)</p>
                        {showValidationErrors && formErrors.design && (
                          <p className="text-red-500 text-sm mt-2 font-medium">⚠️ Please upload your design file to continue</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Campaign Description Section */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/50 mb-4 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">📝 Campaign Description <span className="text-red-600 bg-red-100 px-2 py-1 rounded-lg text-sm font-black">MANDATORY</span></h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Tell us about your advertisement <span className="text-red-600">(Required to proceed)</span>
                    </label>
                    <textarea
                      placeholder="Describe what your advertisement is for... 
Example: 
- Restaurant promotion for Diwali special menu
- Real estate company branding for new project launch  
- Wedding invitation for couple celebration
- Business logo advertisement for grand opening
- Event promotion for music concert"
                      className={`w-full px-4 py-3 border-2 rounded-xl resize-none transition-all duration-200 ${
                        showValidationErrors && formErrors.description 
                          ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-200 bg-gray-50 focus:ring-purple-500 focus:border-purple-500'
                      }`}
                      rows={6}
                      value={campaignDescription}
                      onChange={(e) => setCampaignDescription(e.target.value)}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        Provide details about your business, event, or purpose for better campaign management
                      </p>
                      <span className={`text-xs ${campaignDescription.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                        {campaignDescription.length}/500
                      </span>
                    </div>
                    {showValidationErrors && formErrors.description && (
                      <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 mt-3">
                        <p className="text-red-800 text-sm font-bold">⚠️ MANDATORY FIELD: Campaign description is required!</p>
                        <p className="text-red-700 text-xs mt-1">Please describe what your advertisement is for - this helps us understand your campaign better.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Real-time Price Calculator */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/50 mb-4 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">💰 Real-time Price Calculator</h3>
                
                {/* Selection Mode Toggle */}
                <div className="mb-6">
                  <div className="flex justify-center space-x-4 mb-4">
                    <button
                      onClick={() => setUseMixedSelection(false)}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        !useMixedSelection 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Single Size
                    </button>
                    <button
                      onClick={() => setUseMixedSelection(true)}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        useMixedSelection 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Mixed Sizes
                    </button>
                  </div>
                </div>

                {!useMixedSelection ? (
                  /* Single Size Selection */
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Select Bottle Size:</h4>
                    <div className="space-y-3">
                      {/* 750ml Option */}
                      <div 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          bottleSize === '750ml' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                        }`}
                        onClick={() => setBottleSize('750ml')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              bottleSize === '750ml' ? 'border-blue-500' : 'border-gray-400'
                            }`}>
                              {bottleSize === '750ml' && (
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-800">750ml Water Bottle</div>  
                              <div className="text-sm text-gray-600">Standard size bottle • Standard label format</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">₹70</div>
                            <div className="text-sm text-gray-500">per bottle</div>
                          </div>
                        </div>
                      </div>

                      {/* 1L Option */}
                      <div 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          bottleSize === '1L' 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : 'border-gray-200 bg-gray-50 hover:border-emerald-300'
                        }`}
                        onClick={() => setBottleSize('1L')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              bottleSize === '1L' ? 'border-emerald-500' : 'border-gray-400'
                            }`}>
                              {bottleSize === '1L' && (
                                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-800">1L Water Bottle</div>
                              <div className="text-sm text-gray-600">Large size bottle • Large label format</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-emerald-600">₹80</div>
                            <div className="text-sm text-gray-500">per bottle</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Current Quantity Display for Single Size */}
                    <div className="text-center mb-6 mt-6">
                      <div className="text-4xl font-bold gradient-text mb-2">{quantity.toLocaleString()}</div>
                      <p className="text-lg text-gray-600">{bottleSize} bottles selected</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-blue-700">
                          📦 <span className="font-medium">{Math.ceil(quantity / 12)} pack(s)</span> = {quantity} bottles
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-green-600 mt-2">
                        ₹{(quantity * (bottleSize === '750ml' ? 70 : 80)).toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-500">Total cost (₹{bottleSize === '750ml' ? 70 : 80} per bottle)</p>
                    </div>

                    {/* Quantity Slider */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-600">1,000</span>
                        <span className="text-sm font-medium text-gray-600">50,000</span>
                      </div>
                      <div className="relative py-4">
                        <div className="relative h-6 bg-white border-2 border-black rounded-full shadow-lg overflow-hidden">
                          <div 
                            className="h-full bg-red-600 transition-all duration-300"
                            style={{ width: `${((quantity - 1000) / (50000 - 1000)) * 100}%` }}
                          ></div>
                        </div>
                        <input
                          type="range"
                          min="1000"
                          max="50000"
                          step="100"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value))}
                          className="absolute top-0 left-0 w-full h-14 opacity-0 cursor-pointer z-10"
                        />
                        <div 
                          className="absolute top-1/2 transform -translate-y-1/2 w-8 h-8 bg-red-600 border-2 border-black rounded-full shadow-lg transition-all duration-300 pointer-events-none z-20"
                          style={{ left: `calc(${((quantity - 1000) / (50000 - 1000)) * 100}% - 16px)` }}
                        ></div>
                      </div>
                    </div>

                    {/* Order Summary for Single Size */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-700 mb-2">Order Summary</div>
                        <div className="text-lg font-bold text-gray-800">
                          {quantity.toLocaleString()} × {bottleSize} bottles
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          📦 {Math.ceil(quantity / 12)} pack(s) • 12 bottles per pack
                        </div>
                        <div className="text-xl font-bold text-green-600 mt-1">
                          Total: ₹{(quantity * (bottleSize === '750ml' ? 70 : 80)).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Mixed Size Selection */
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Select Mixed Bottle Quantities:</h4>
                    <div className="space-y-4">
                      {/* 750ml Quantity Selector */}
                      <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-lg font-bold text-gray-800">750ml Water Bottles</div>
                            <div className="text-sm text-blue-600">₹70 per bottle • Standard label format</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{mixedBottles['750ml'].toLocaleString()}</div>
                            <div className="text-sm text-gray-500">bottles</div>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50000"
                          step="100"
                          value={mixedBottles['750ml']}
                          onChange={(e) => setMixedBottles({...mixedBottles, '750ml': parseInt(e.target.value)})}
                          className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider-thumb-blue"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0</span>
                          <span>50,000</span>
                        </div>
                      </div>

                      {/* 1L Quantity Selector */}
                      <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-lg font-bold text-gray-800">1L Water Bottles</div>
                            <div className="text-sm text-emerald-600">₹80 per bottle • Large label format</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-600">{mixedBottles['1L'].toLocaleString()}</div>
                            <div className="text-sm text-gray-500">bottles</div>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50000"
                          step="100"
                          value={mixedBottles['1L']}
                          onChange={(e) => setMixedBottles({...mixedBottles, '1L': parseInt(e.target.value)})}
                          className="w-full h-3 bg-emerald-200 rounded-lg appearance-none cursor-pointer slider-thumb-emerald"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0</span>
                          <span>50,000</span>
                        </div>
                      </div>

                      {/* Mixed Bottles Summary */}
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                        <h5 className="text-lg font-bold text-gray-800 mb-2">Mixed Order Summary</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-700">750ml bottles:</span>
                            <span className="font-semibold">{mixedBottles['750ml'].toLocaleString()} × ₹70 = ₹{(mixedBottles['750ml'] * 70).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">1L bottles:</span>
                            <span className="font-semibold">{mixedBottles['1L'].toLocaleString()} × ₹80 = ₹{(mixedBottles['1L'] * 80).toLocaleString()}</span>
                          </div>
                          <div className="border-t border-purple-300 pt-2">
                            <div className="flex justify-between">
                              <span className="text-lg font-bold text-gray-800">Total:</span>
                              <span className="text-xl font-bold text-purple-600">₹{((mixedBottles['750ml'] * 70) + (mixedBottles['1L'] * 80)).toLocaleString()}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              📦 {Math.ceil((mixedBottles['750ml'] + mixedBottles['1L']) / 12)} pack(s) total • {(mixedBottles['750ml'] + mixedBottles['1L']).toLocaleString()} bottles
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Distribution Options */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/50 mb-4 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">📍 Distribution Options</h3>
                
                {/* Pack Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="text-xl sm:text-2xl">📦</div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-blue-800">Pack Information</h4>
                      <p className="text-xs sm:text-sm text-blue-700">
                        <span className="font-medium">1 Pack = 12 Bottles</span> • Professional packaging for safe delivery
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* In Stores Option */}
                  <div 
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedOption === 'inStores' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedOption('inStores')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedOption === 'inStores' ? 'border-blue-500' : 'border-gray-400'
                      }`}>
                        {selectedOption === 'inStores' && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">🏪 In Stores</p>
                        <p className="text-sm text-gray-600">Distribute through retail network</p>
                      </div>
                    </div>
                  </div>

                  {/* At Your Location Option */}
                  <div 
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedOption === 'atYourLocation' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-200 bg-gray-50 hover:border-emerald-300'
                    }`}
                    onClick={() => setSelectedOption('atYourLocation')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedOption === 'atYourLocation' ? 'border-emerald-500' : 'border-gray-400'
                      }`}>
                        {selectedOption === 'atYourLocation' && (
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">🏢 At Your Location</p>
                        <p className="text-sm text-gray-600">Direct delivery to your address</p>
                      </div>
                    </div>
                  </div>

                  {/* Split Option */}
                  <div 
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedOption === 'split' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedOption('split')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedOption === 'split' ? 'border-purple-500' : 'border-gray-400'
                      }`}>
                        {selectedOption === 'split' && (
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">🔀 Split Distribution</p>
                        <p className="text-sm text-gray-600">Partial store + partial direct delivery</p>
                      </div>
                    </div>
                  </div>

                  {/* Split Quantity Controls */}
                  {selectedOption === 'split' && (
                    <div className="mt-4 space-y-4 bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <h4 className="font-semibold text-purple-800 mb-3">🔀 Split Distribution Details</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🏪 Bottles in stores:
                          </label>
                          <div className="text-xs text-gray-500 mb-2">
                            📦 {Math.ceil(splitQuantities.stores / 12)} pack(s) = {splitQuantities.stores} bottles
                          </div>
                          <input
                            type="number"
                            min="0"
                            max={useMixedSelection ? (mixedBottles['750ml'] + mixedBottles['1L']) : quantity}
                            value={splitQuantities.stores}
                            onChange={(e) => {
                              const storeQty = parseInt(e.target.value) || 0;
                              const totalQty = useMixedSelection ? (mixedBottles['750ml'] + mixedBottles['1L']) : quantity;
                              const remaining = totalQty - storeQty;
                              setSplitQuantities({
                                stores: storeQty,
                                yourLocation: remaining >= 0 ? remaining : 0,
                              });
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🏢 Bottles at your location:
                          </label>
                          <div className="text-xs text-gray-500 mb-2">
                            📦 {Math.ceil(splitQuantities.yourLocation / 12)} pack(s) = {splitQuantities.yourLocation} bottles
                          </div>
                          <input
                            type="number"
                            min="0"
                            max={useMixedSelection ? (mixedBottles['750ml'] + mixedBottles['1L']) : quantity}
                            value={splitQuantities.yourLocation}
                            onChange={(e) => {
                              const locationQty = parseInt(e.target.value) || 0;
                              const totalQty = useMixedSelection ? (mixedBottles['750ml'] + mixedBottles['1L']) : quantity;
                              const remaining = totalQty - locationQty;
                              setSplitQuantities({
                                stores: remaining >= 0 ? remaining : 0,
                                yourLocation: locationQty,
                              });
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Input for At Your Location */}
              {selectedOption === 'atYourLocation' && (
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/50 mb-4 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">🏢 Delivery Address</h3>
                  
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-emerald-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-emerald-800 mb-1">Direct Delivery</h4>
                        <p className="text-sm text-emerald-700">
                          Your bottles will be delivered directly to your specified address.
                          <span className="font-medium"> Delivery time: 5-7 working days</span> from order confirmation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select City</label>
                        <select 
                          value={selectedCity}
                          onChange={(e) => {
                            setSelectedCity(e.target.value);
                            setSelectedArea(''); // Reset area when city changes
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="">Choose your city...</option>
                          {Object.keys(cityAreaData).map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Area</label>
                        <select
                          value={selectedArea}
                          onChange={(e) => setSelectedArea(e.target.value)}
                          disabled={!selectedCity}
                          data-testid="select-area"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed scrollable-dropdown ${
                            showValidationErrors && formErrors.location 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                        >
                          <option value="">Choose your area...</option>
                          {selectedCity && cityAreaData[selectedCity]?.map((area) => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                        {showValidationErrors && formErrors.location && !selectedArea && (
                          <p className="text-red-500 text-sm mt-1">Please select an area</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Complete Address</label>
                      <textarea
                        value={customerDetails.address}
                        onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                        placeholder="House No., Building Name, Street Name, Landmark..."
                        data-testid="input-delivery-address"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none ${
                          showValidationErrors && formErrors.address 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        rows={3}
                      />
                      {showValidationErrors && formErrors.address && (
                        <p className="text-red-500 text-sm mt-1">Please enter your complete address</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                        <input
                          type="text"
                          value={customerDetails.pincode}
                          onChange={(e) => setCustomerDetails({...customerDetails, pincode: e.target.value})}
                          placeholder="Enter PIN code"
                          data-testid="input-pincode"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            showValidationErrors && formErrors.address 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={customerDetails.phone}
                          onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                          placeholder="Enter phone number"
                          data-testid="input-phone"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            showValidationErrors && formErrors.address 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Input for Split Distribution */}
              {selectedOption === 'split' && (
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/50 mb-4 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">📍 Split Distribution Address</h3>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-purple-800 mb-1">Split Delivery Information</h4>
                        <p className="text-sm text-purple-700">
                          Part of your order will go to stores, part will be delivered to your address.
                          <span className="font-medium"> Store delivery: 3-5 days, Direct delivery: 5-7 days</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Location Selector for Split */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">🏪 Location Selector (for {splitQuantities.stores.toLocaleString()} bottles)</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select City</label>
                          <select 
                            value={splitStoreCity}
                            onChange={(e) => {
                              setSplitStoreCity(e.target.value);
                              setSplitStoreArea(''); // Reset area when city changes
                            }}
                            data-testid="select-split-store-city"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              showValidationErrors && formErrors.splitLocation 
                                ? 'border-red-500 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                          >
                            <option value="">Choose city...</option>
                            {Object.keys(cityAreaData).map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                          {showValidationErrors && formErrors.splitLocation && !splitStoreCity && (
                            <p className="text-red-500 text-sm mt-1">Please select store city</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Area</label>
                          <select 
                            value={splitStoreArea}
                            onChange={(e) => setSplitStoreArea(e.target.value)}
                            disabled={!splitStoreCity}
                            data-testid="select-split-store-area"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed scrollable-dropdown ${
                              showValidationErrors && formErrors.splitLocation 
                                ? 'border-red-500 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                          >
                            <option value="">Choose area...</option>
                            {splitStoreCity && cityAreaData[splitStoreCity]?.map((area) => (
                              <option key={area} value={area}>{area}</option>
                            ))}
                          </select>
                          {showValidationErrors && formErrors.splitLocation && !splitStoreArea && (
                            <p className="text-red-500 text-sm mt-1">Please select store area</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Direct Delivery Address for Split */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">🏢 Your Address (for {splitQuantities.yourLocation.toLocaleString()} bottles)</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                          <textarea
                            value={customerDetails.splitAddress}
                            onChange={(e) => setCustomerDetails({...customerDetails, splitAddress: e.target.value})}
                            placeholder="Enter your complete delivery address..."
                            data-testid="input-split-address"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                              showValidationErrors && formErrors.splitAddress 
                                ? 'border-red-500 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                            rows={3}
                          />
                          {showValidationErrors && formErrors.splitAddress && (
                            <p className="text-red-500 text-sm mt-1">Please enter your complete address</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                          <input
                            type="text"
                            placeholder="Enter PIN code"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Selector (only for inStores option) */}
              {selectedOption === 'inStores' && (
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/50 mb-4 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">🏪 Location Selector</h3>
                  
                  {/* Delivery Information Banner */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-800 mb-1">Delivery Information</h4>
                        <p className="text-sm text-blue-700">
                          Your campaign product will be available at stores near your selected area. 
                          <span className="font-medium">Delivery time: 3-5 working days</span> to reach retail stores in your chosen location.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* City Selection */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        Select City
                      </h4>
                      <div className="max-h-60 overflow-y-auto scrollable-dropdown">
                        <div className="grid grid-cols-1 gap-2">
                          {Object.keys(cityAreaData).map((city) => (
                            <div 
                              key={city}
                              className={`p-2 rounded-lg border cursor-pointer transition-all ${
                                selectedCity === city 
                                  ? 'border-blue-500 bg-blue-50 text-blue-800' 
                                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                              }`}
                              onClick={() => {
                                setSelectedCity(city);
                                setSelectedArea(''); // Reset area when city changes
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                                  selectedCity === city ? 'border-blue-500' : 'border-gray-400'
                                }`}>
                                  {selectedCity === city && (
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <span className="text-sm font-medium">{city}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Area Selection */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4m6 0a2 2 0 002-2v-1a2 2 0 00-2-2H9a2 2 0 00-2 2v1a2 2 0 002 2zm8-2v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2"></path>
                        </svg>
                        Select Area
                      </h4>
                      {selectedCity ? (
                        <div className="max-h-80 overflow-y-auto scrollable-dropdown">
                          <div className="grid grid-cols-1 gap-2">
                            {cityAreaData[selectedCity].map((area) => (
                              <div 
                                key={area}
                                className={`p-2 rounded-lg border cursor-pointer transition-all ${
                                  selectedArea === area 
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
                                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                                }`}
                                onClick={() => setSelectedArea(area)}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                                    selectedArea === area ? 'border-emerald-500' : 'border-gray-400'
                                  }`}>
                                    {selectedArea === area && (
                                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                    )}
                                  </div>
                                  <span className="text-sm font-medium">{area}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <p>Please select a city first</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Form Validation Summary */}
              {showValidationErrors && Object.keys(formErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-800 mb-2">⚠️ Please Complete All Required Fields</h3>
                      <ul className="text-sm text-red-700 space-y-1">
                        {formErrors.description && <li>• 📝 Write a description about your advertisement purpose (MANDATORY)</li>}
                        {formErrors.design && <li>• Upload your design file (logo/image)</li>}
                        {formErrors.location && <li>• Select both city and area for your campaign location</li>}
                        {formErrors.address && <li>• Complete your delivery address details</li>}
                        {formErrors.splitLocation && <li>• Complete store location for split distribution</li>}
                        {formErrors.splitAddress && <li>• Complete your address for split distribution</li>}
                        {formErrors.quantity && <li>• Select at least 1000 bottles to proceed</li>}
                      </ul>
                      <p className="text-red-600 font-medium mt-3">
                        🚫 All fields must be filled before payment can proceed
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Campaign Button */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/50 mb-4 sm:mb-8">
                <div className="text-center">
                  <button
                    onClick={validateAndProceedToPayment}
                    data-testid="button-submit-campaign"
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white text-lg font-bold rounded-2xl hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    🚀 Submit Campaign & Make Payment
                  </button>
                  <p className="text-sm text-gray-600 mt-3">
                    Complete your campaign setup and proceed to secure payment
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <p className="text-xs text-blue-700">
                      <span className="font-medium">💡 Pro Tip:</span> Make sure all fields are completed before proceeding to payment
                    </p>
                  </div>
                  
                  {/* Design Preview Notification */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-green-800 mb-2">📱 Design Preview Delivery</h4>
                        <p className="text-sm text-green-700 mb-3">
                          After approval, you'll receive your bottle design preview within <span className="font-medium">1-2 hours</span>
                        </p>
                        
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-green-800">Choose how you'd like to receive your design preview:</p>
                          <div className="flex flex-wrap gap-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="previewDelivery"
                                value="whatsapp"
                                defaultChecked
                                className="w-4 h-4 text-green-500 focus:ring-green-500 focus:ring-2"
                                data-testid="radio-whatsapp-delivery"
                              />
                              <span className="text-sm text-green-700">📱 WhatsApp</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="previewDelivery"
                                value="email"
                                className="w-4 h-4 text-green-500 focus:ring-green-500 focus:ring-2"
                                data-testid="radio-email-delivery"
                              />
                              <span className="text-sm text-green-700">📧 Email</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Campaign Tracking Dashboard Tab */}
          {dashboardTab === 'tracking' && (
            <div className="space-y-6">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 border border-white/50">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="text-3xl mr-3">📊</span>
                  Campaign Tracking Dashboard
                </h3>
                
                {campaignSubmitted && campaignData ? (
                  /* Show submitted campaign */
                  <div className="space-y-6">
                    {/* Campaign Status Banner */}
                    <div className={`rounded-xl p-6 border ${
                      campaignData.status === 'pending' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' :
                      campaignData.status === 'approved' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                      campaignData.status === 'production' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200' :
                      campaignData.status === 'delivered' ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' :
                      'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">
                          {campaignData.status === 'pending' && '📋'}
                          {campaignData.status === 'approved' && '✅'}
                          {campaignData.status === 'production' && '🏭'}
                          {campaignData.status === 'delivered' && '🚚'}
                        </div>
                        <div>
                          <h4 className={`text-xl font-bold ${
                            campaignData.status === 'pending' ? 'text-yellow-800' :
                            campaignData.status === 'approved' ? 'text-green-800' :
                            campaignData.status === 'production' ? 'text-blue-800' :
                            campaignData.status === 'delivered' ? 'text-purple-800' :
                            'text-gray-800'
                          }`}>
                            {campaignData.status === 'pending' && 'Campaign Submitted'}
                            {campaignData.status === 'approved' && 'Campaign Approved'}
                            {campaignData.status === 'production' && 'In Production'}
                            {campaignData.status === 'delivered' && 'Delivered'}
                          </h4>
                          <p className={`mt-1 ${
                            campaignData.status === 'pending' ? 'text-yellow-700' :
                            campaignData.status === 'approved' ? 'text-green-700' :
                            campaignData.status === 'production' ? 'text-blue-700' :
                            campaignData.status === 'delivered' ? 'text-purple-700' :
                            'text-gray-700'
                          }`}>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              campaignData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              campaignData.status === 'approved' ? 'bg-green-100 text-green-800' :
                              campaignData.status === 'production' ? 'bg-blue-100 text-blue-800' :
                              campaignData.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {campaignData.status === 'pending' && '⏳ Waiting for Approval'}
                              {campaignData.status === 'approved' && '✅ Approved - Starting Production'}
                              {campaignData.status === 'production' && '🏭 In Production'}
                              {campaignData.status === 'delivered' && '🚚 Delivered Successfully'}
                            </span>
                          </p>
                          <p className={`text-sm mt-2 ${
                            campaignData.status === 'pending' ? 'text-yellow-600' :
                            campaignData.status === 'approved' ? 'text-green-600' :
                            campaignData.status === 'production' ? 'text-blue-600' :
                            campaignData.status === 'delivered' ? 'text-purple-600' :
                            'text-gray-600'
                          }`}>
                            {campaignData.status === 'pending' && 'Your campaign is under review by our team. You\'ll be notified once it\'s approved and ready for production.'}
                            {campaignData.status === 'approved' && 'Great! Your campaign has been approved and will start production soon.'}
                            {campaignData.status === 'production' && 'Your bottles are being manufactured and branded according to your specifications.'}
                            {campaignData.status === 'delivered' && 'Your custom branded bottles have been successfully delivered!'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Campaign Details Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                      <h5 className="text-lg font-bold text-gray-800 mb-4">📋 Campaign Details</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Bottle Configuration</p>
                            <p className="font-semibold text-gray-800">
                              {campaignData.bottleType}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Distribution Method</p>
                            <p className="font-semibold text-gray-800">
                              🏪 {campaignData.distribution}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Target Location</p>
                            <p className="font-semibold text-gray-800">
                              {campaignData.location}
                            </p>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Design Status</p>
                            <p className="font-semibold text-gray-800">
                              📁 {campaignData.design}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Payment Method</p>
                            <p className="font-semibold text-gray-800">
                              💳 {campaignData.paymentMethod}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-2xl font-bold text-green-600">
                              ₹{campaignData.totalAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Timeline */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h6 className="text-md font-semibold text-gray-800 mb-4">📅 Order Timeline</h6>
                        <div className="space-y-3">
                          {/* Order Submitted - Always completed */}
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="font-medium text-gray-800">Order Submitted</p>
                              <p className="text-sm text-gray-500">{campaignData.submittedAt}</p>
                            </div>
                          </div>
                          
                          {/* Approval Status */}
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              campaignData.status === 'pending' ? 'bg-yellow-500 animate-pulse' :
                              ['approved', 'production', 'delivered'].includes(campaignData.status) ? 'bg-green-500' :
                              'bg-gray-300'
                            }`}></div>
                            <div>
                              <p className={`font-medium ${
                                campaignData.status === 'pending' ? 'text-gray-800' :
                                ['approved', 'production', 'delivered'].includes(campaignData.status) ? 'text-gray-800' :
                                'text-gray-400'
                              }`}>
                                {campaignData.status === 'pending' ? 'Waiting for Approval' : 'Approved'}
                              </p>
                              <p className={`text-sm ${
                                campaignData.status === 'pending' ? 'text-gray-500' :
                                ['approved', 'production', 'delivered'].includes(campaignData.status) ? 'text-gray-500' :
                                'text-gray-400'
                              }`}>
                                {campaignData.status === 'pending' ? 'In progress...' : 
                                 ['approved', 'production', 'delivered'].includes(campaignData.status) ? 'Completed' : 
                                 'Pending approval'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Production Status */}
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              campaignData.status === 'production' ? 'bg-blue-500 animate-pulse' :
                              campaignData.status === 'delivered' ? 'bg-green-500' :
                              'bg-gray-300'
                            }`}></div>
                            <div>
                              <p className={`font-medium ${
                                campaignData.status === 'production' ? 'text-gray-800' :
                                campaignData.status === 'delivered' ? 'text-gray-800' :
                                'text-gray-400'
                              }`}>
                                Production Start
                              </p>
                              <p className={`text-sm ${
                                campaignData.status === 'production' ? 'text-gray-500' :
                                campaignData.status === 'delivered' ? 'text-gray-500' :
                                'text-gray-400'
                              }`}>
                                {campaignData.status === 'production' ? 'Manufacturing in progress...' :
                                 campaignData.status === 'delivered' ? 'Completed' :
                                 ['approved'].includes(campaignData.status) ? 'Starting soon...' :
                                 'Pending approval'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Delivery Status */}
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              campaignData.status === 'delivered' ? 'bg-purple-500' : 'bg-gray-300'
                            }`}></div>
                            <div>
                              <p className={`font-medium ${
                                campaignData.status === 'delivered' ? 'text-gray-800' : 'text-gray-400'
                              }`}>
                                Delivery
                              </p>
                              <p className={`text-sm ${
                                campaignData.status === 'delivered' ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                {campaignData.status === 'delivered' ? 'Successfully delivered!' :
                                 campaignData.status === 'production' ? 'Preparing for dispatch...' :
                                 ['approved'].includes(campaignData.status) ? 'Awaiting production completion' :
                                 'Pending approval'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Admin Control Panel (Demo) */}
                      <div className="mt-6 p-4 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                        <h6 className="text-sm font-semibold text-gray-700 mb-3">🔧 Admin Control (Demo Only)</h6>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setCampaignData((prev: any) => ({ ...prev, status: 'pending' }))}
                            className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                          >
                            Set Pending
                          </button>
                          <button
                            onClick={() => setCampaignData((prev: any) => ({ ...prev, status: 'approved' }))}
                            className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          >
                            Approve Campaign
                          </button>
                          <button
                            onClick={() => setCampaignData((prev: any) => ({ ...prev, status: 'production' }))}
                            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                          >
                            Start Production
                          </button>
                          <button
                            onClick={() => setCampaignData((prev: any) => ({ ...prev, status: 'delivered' }))}
                            className="px-3 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                          >
                            Mark Delivered
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          (This demo panel shows how admin can control campaign status from Admin Panel)
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty state */
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🚀</div>
                    <h4 className="text-xl font-bold text-gray-700 mb-2">Your campaigns will appear here</h4>
                    <p className="text-gray-500">Start by creating your first campaign in the design tab</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Campaign Studio Tab */}
          {dashboardTab === 'studio' && (
            <div className="space-y-6">
              <CampaignStudioContent />
            </div>
          )}
        </div>
      </div>

      {/* This modal is no longer used - checkout is now a separate page */}
      {false && showCheckoutForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            
            {/* Checkout Header with Steps */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Secure Checkout</h2>
                <button
                  onClick={() => setShowCheckoutForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center ${checkoutStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      checkoutStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      1
                    </div>
                    <span className="ml-2 text-sm font-medium">Customer Info</span>
                  </div>
                  <div className={`w-12 h-0.5 ${checkoutStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <div className={`flex items-center ${checkoutStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      checkoutStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      2
                    </div>
                    <span className="ml-2 text-sm font-medium">Payment</span>
                  </div>
                  <div className={`w-12 h-0.5 ${checkoutStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <div className={`flex items-center ${checkoutStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      checkoutStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      3
                    </div>
                    <span className="ml-2 text-sm font-medium">Confirmation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Customer Information */}
            {checkoutStep === 1 && (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Customer Information</h3>
                  <p className="text-gray-600">Please provide your details for order processing and delivery</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={checkoutCustomerInfo.fullName}
                      onChange={(e) => setCheckoutCustomerInfo({...checkoutCustomerInfo, fullName: e.target.value})}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      data-testid="input-checkout-fullname"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={checkoutCustomerInfo.email}
                      onChange={(e) => setCheckoutCustomerInfo({...checkoutCustomerInfo, email: e.target.value})}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      data-testid="input-checkout-email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={checkoutCustomerInfo.phone}
                      onChange={(e) => setCheckoutCustomerInfo({...checkoutCustomerInfo, phone: e.target.value})}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      data-testid="input-checkout-phone"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name (Optional)</label>
                    <input
                      type="text"
                      value={checkoutCustomerInfo.companyName}
                      onChange={(e) => setCheckoutCustomerInfo({...checkoutCustomerInfo, companyName: e.target.value})}
                      placeholder="Your company name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      data-testid="input-checkout-company"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Complete Address *</label>
                  <textarea
                    value={checkoutCustomerInfo.address}
                    onChange={(e) => setCheckoutCustomerInfo({...checkoutCustomerInfo, address: e.target.value})}
                    placeholder="House number, street name, area, landmark"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    data-testid="input-checkout-address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={checkoutCustomerInfo.city}
                      onChange={(e) => setCheckoutCustomerInfo({...checkoutCustomerInfo, city: e.target.value})}
                      placeholder="City name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      data-testid="input-checkout-city"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <select
                      value={checkoutCustomerInfo.state}
                      onChange={(e) => setCheckoutCustomerInfo({...checkoutCustomerInfo, state: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      data-testid="select-checkout-state"
                    >
                      <option value="">Select State</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Assam">Assam</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Goa">Goa</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                      <option value="Ladakh">Ladakh</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code *</label>
                    <input
                      type="text"
                      value={checkoutCustomerInfo.pincode}
                      onChange={(e) => setCheckoutCustomerInfo({...checkoutCustomerInfo, pincode: e.target.value})}
                      placeholder="160017"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      data-testid="input-checkout-pincode"
                    />
                  </div>
                </div>

                {/* Design Preview Delivery Options */}
                <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-green-800 mb-2">Design Preview Delivery</h4>
                  <p className="text-sm text-green-700 mb-3">
                    After approval, you'll receive your bottle design preview within <span className="font-medium">1-2 hours</span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="checkoutPreviewDelivery"
                        value="whatsapp"
                        defaultChecked
                        className="w-4 h-4 text-green-500 focus:ring-green-500 focus:ring-2"
                        data-testid="radio-checkout-whatsapp"
                      />
                      <span className="text-sm text-green-700">📱 WhatsApp</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="checkoutPreviewDelivery"
                        value="email"
                        className="w-4 h-4 text-green-500 focus:ring-green-500 focus:ring-2"
                        data-testid="radio-checkout-email"
                      />
                      <span className="text-sm text-green-700">📧 Email</span>
                    </label>
                  </div>
                </div>

                {/* Step 1 Actions */}
                <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowCheckoutForm(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                    data-testid="button-checkout-cancel"
                  >
                    ← Back to Campaign
                  </button>
                  <button
                    onClick={() => {
                      // Validate customer info
                      const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
                      const isValid = requiredFields.every(field => checkoutCustomerInfo[field as keyof typeof checkoutCustomerInfo].trim());
                      
                      if (isValid) {
                        setCheckoutStep(2);
                      } else {
                        alert('Please fill in all required fields');
                      }
                    }}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                    data-testid="button-proceed-to-payment"
                  >
                    Continue to Payment →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {checkoutStep === 2 && (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Information</h3>
                  <p className="text-gray-600">Choose your preferred payment method</p>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Summary</h4>
                  <div className="text-lg font-bold text-gray-800">
                    {useMixedSelection ? 
                      `${(mixedBottles['750ml'] + mixedBottles['1L']).toLocaleString()} Mixed Bottles` :
                      `${quantity.toLocaleString()} × ${bottleSize} bottles`
                    }
                  </div>
                  <div className="text-xl font-bold text-green-600 mt-1">
                    Total: ₹{useMixedSelection ? 
                      ((mixedBottles['750ml'] * 70) + (mixedBottles['1L'] * 80)).toLocaleString() :
                      (quantity * (bottleSize === '750ml' ? 70 : 80)).toLocaleString()
                    }
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800">Select Payment Method</h4>
                  
                  {/* Card Payment Option */}
                  <div 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'card' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                    }`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'card' ? 'border-blue-500' : 'border-gray-400'
                      }`}>
                        {paymentMethod === 'card' && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">💳 Card Payment</p>
                        <p className="text-sm text-gray-600">Visa, MasterCard, RuPay</p>
                      </div>
                    </div>
                  </div>

                  {/* UPI Payment Option */}
                  <div 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'upi' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                    }`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'upi' ? 'border-purple-500' : 'border-gray-400'
                      }`}>
                        {paymentMethod === 'upi' && (
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">📱 UPI Payment</p>
                        <p className="text-sm text-gray-600">PhonePe, Google Pay, Paytm</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Validation Errors */}
                {showPaymentValidation && Object.keys(paymentValidationErrors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div>
                        <h4 className="text-sm font-bold text-red-800 mb-1">Please complete payment details</h4>
                        <p className="text-sm text-red-600">All payment fields are required to proceed</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                      <input
                        type="text"
                        value={paymentFormData.cardNumber}
                        onChange={(e) => setPaymentFormData({...paymentFormData, cardNumber: e.target.value})}
                        placeholder="1234 5678 9012 3456"
                        data-testid="input-card-number"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          showPaymentValidation && paymentValidationErrors.cardNumber 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                      />
                      {showPaymentValidation && paymentValidationErrors.cardNumber && (
                        <p className="text-red-500 text-sm mt-1">Card number is required</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          value={paymentFormData.expiryDate}
                          onChange={(e) => setPaymentFormData({...paymentFormData, expiryDate: e.target.value})}
                          placeholder="MM/YY"
                          data-testid="input-expiry-date"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            showPaymentValidation && paymentValidationErrors.expiryDate 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                        />
                        {showPaymentValidation && paymentValidationErrors.expiryDate && (
                          <p className="text-red-500 text-sm mt-1">Expiry date is required</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <input
                          type="text"
                          value={paymentFormData.cvv}
                          onChange={(e) => setPaymentFormData({...paymentFormData, cvv: e.target.value})}
                          placeholder="123"
                          data-testid="input-cvv"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            showPaymentValidation && paymentValidationErrors.cvv 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                        />
                        {showPaymentValidation && paymentValidationErrors.cvv && (
                          <p className="text-red-500 text-sm mt-1">CVV is required</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        value={paymentFormData.cardholderName}
                        onChange={(e) => setPaymentFormData({...paymentFormData, cardholderName: e.target.value})}
                        placeholder="Enter name on card"
                        data-testid="input-cardholder-name"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          showPaymentValidation && paymentValidationErrors.cardholderName 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                      />
                      {showPaymentValidation && paymentValidationErrors.cardholderName && (
                        <p className="text-red-500 text-sm mt-1">Cardholder name is required</p>
                      )}
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                      <input
                        type="text"
                        value={paymentFormData.upiId}
                        onChange={(e) => setPaymentFormData({...paymentFormData, upiId: e.target.value})}
                        placeholder="yourname@paytm"
                        data-testid="input-upi-id"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          showPaymentValidation && paymentValidationErrors.upiId 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                      />
                      {showPaymentValidation && paymentValidationErrors.upiId && (
                        <p className="text-red-500 text-sm mt-1">UPI ID is required</p>
                      )}
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                      <p className="text-sm text-purple-700">
                        Enter your UPI ID (e.g., 9876543210@paytm, name@okaxis, etc.)
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2 Actions */}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setCheckoutStep(1)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                    data-testid="button-back-to-info"
                  >
                    ← Back to Info
                  </button>
                  <button
                    onClick={validatePaymentAndProceed}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
                    data-testid="button-process-payment"
                  >
                    Process Payment →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Final Confirmation */}
            {checkoutStep === 3 && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Your Order</h3>
                  <p className="text-gray-600">Please review all details before final submission</p>
                </div>

                {/* Customer Details */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">👤 Customer Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-600">Name:</span> <span className="font-medium">{checkoutCustomerInfo.fullName}</span></div>
                    <div><span className="text-gray-600">Email:</span> <span className="font-medium">{checkoutCustomerInfo.email}</span></div>
                    <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{checkoutCustomerInfo.phone}</span></div>
                    {checkoutCustomerInfo.companyName && (
                      <div><span className="text-gray-600">Company:</span> <span className="font-medium">{checkoutCustomerInfo.companyName}</span></div>
                    )}
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Address:</span> 
                      <span className="font-medium"> {checkoutCustomerInfo.address}, {checkoutCustomerInfo.city}, {checkoutCustomerInfo.state} - {checkoutCustomerInfo.pincode}</span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">📦 Order Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bottles:</span>
                      <span className="font-medium">
                        {useMixedSelection ? 
                          `Mixed (${mixedBottles['750ml']} × 750ml + ${mixedBottles['1L']} × 1L)` :
                          `${quantity.toLocaleString()} × ${bottleSize}`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distribution:</span>
                      <span className="font-medium">
                        {selectedOption === 'inStores' ? '🏪 In Stores' :
                         selectedOption === 'atYourLocation' ? '🚚 Direct Delivery' :
                         '📦 Split Distribution'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment:</span>
                      <span className="font-medium">{paymentMethod === 'card' ? '💳 Card Payment' : '📱 UPI Payment'}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span className="text-gray-800 font-semibold">Total Amount:</span>
                      <span className="text-xl font-bold text-green-600">
                        ₹{useMixedSelection ? 
                          ((mixedBottles['750ml'] * 70) + (mixedBottles['1L'] * 80)).toLocaleString() :
                          (quantity * (bottleSize === '750ml' ? 70 : 80)).toLocaleString()
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Final Actions */}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setCheckoutStep(2)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                    data-testid="button-back-to-payment"
                  >
                    ← Back to Payment
                  </button>
                  <button
                    onClick={async () => {
                      // Submit the order with all collected information
                      setShowCheckoutForm(false);
                      setOrderSubmitted(true);
                      setCampaignSubmitted(true);
                      
                      // Create comprehensive order data
                      const campaignId = `BW${Date.now()}`;
                      const transactionId = `TXN${Date.now()}`;
                      const totalAmount = useMixedSelection ? 
                        ((mixedBottles['750ml'] * 70) + (mixedBottles['1L'] * 80)) :
                        (quantity * (bottleSize === '750ml' ? 70 : 80));
                      
                      const orderData = {
                        campaignId,
                        transactionId,
                        customerName: checkoutCustomerInfo.fullName,
                        email: checkoutCustomerInfo.email,
                        phone: checkoutCustomerInfo.phone,
                        amount: totalAmount,
                        distributionOption: selectedOption === 'inStores' ? 'In Stores' : 
                                           selectedOption === 'atYourLocation' ? 'Direct Delivery' : 
                                           'Split Distribution',
                        city: selectedCity || checkoutCustomerInfo.city,
                        area: selectedArea,
                        paymentMethod: paymentMethod === 'card' ? 'Card Payment' : 'UPI Payment',
                        designFile: uploadedFile ? uploadedFile.name : 'Ready for upload',
                        customerDetails: checkoutCustomerInfo,
                        orderSummary: JSON.stringify({
                          bottleType: useMixedSelection ? 
                            `Mixed (${mixedBottles['750ml']} × 750ml + ${mixedBottles['1L']} × 1L)` :
                            `${quantity.toLocaleString()} × ${bottleSize}`,
                          quantity: useMixedSelection ? (mixedBottles['750ml'] + mixedBottles['1L']) : quantity,
                          bottleSize: useMixedSelection ? 'Mixed' : bottleSize,
                          designUploaded: uploadedFile ? 'Yes' : 'No'
                        }),
                        status: 'pending'
                      };
                      
                      try {
                        const savedEmailConfig = localStorage.getItem('billboardwalker_email_config');
                        const emailConfig = savedEmailConfig ? JSON.parse(savedEmailConfig) : null;
                        
                        const response = await fetch('/api/order-campaigns', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...orderData, emailConfig })
                        });
                        
                        if (response.ok) {
                          const result = await response.json();

                          
                          // Save campaign data
                          const newCampaignData = {
                            id: result.id,
                            status: 'pending',
                            bottleType: useMixedSelection ? 
                              `Mixed (${mixedBottles['750ml']} × 750ml + ${mixedBottles['1L']} × 1L)` :
                              `${quantity.toLocaleString()} × ${bottleSize}`,
                            distribution: selectedOption === 'inStores' ? 'In Stores' : 
                                          selectedOption === 'atYourLocation' ? 'Direct Delivery' : 
                                          'Split Distribution',
                            location: selectedCity && selectedArea ? `${selectedArea}, ${selectedCity}` : 
                                     `${checkoutCustomerInfo.city}, ${checkoutCustomerInfo.state}`,
                            design: uploadedFile ? uploadedFile.name : 'Ready for upload',
                            paymentMethod: paymentMethod === 'card' ? 'Card Payment' : 'UPI Payment',
                            totalAmount,
                            submittedAt: new Date().toLocaleString(),
                            campaignId,
                            transactionId,
                            customerInfo: checkoutCustomerInfo,
                            statusHistory: [
                              { status: 'pending', timestamp: new Date().toLocaleString(), message: 'Professional order submitted and confirmation email sent' }
                            ]
                          };
                          setCampaignData(newCampaignData);
                        }
                      } catch (error) {

                      }
                      
                      setTimeout(() => {
                        setDashboardTab('tracking');
                      }, 3000);
                    }}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-lg transform hover:scale-105"
                    data-testid="button-submit-order"
                  >
                    Submit Order ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legacy Payment Modal - Hidden */}
      {false && showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">💳 Payment Options</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Order Summary in Modal */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Summary</h4>
              <div className="text-lg font-bold text-gray-800">
                {useMixedSelection ? 
                  `${(mixedBottles['750ml'] + mixedBottles['1L']).toLocaleString()} Mixed Bottles` :
                  `${quantity.toLocaleString()} × ${bottleSize} bottles`
                }
              </div>
              <div className="text-xl font-bold text-green-600 mt-1">
                Total: ₹{useMixedSelection ? 
                  ((mixedBottles['750ml'] * 70) + (mixedBottles['1L'] * 80)).toLocaleString() :
                  (quantity * (bottleSize === '750ml' ? 70 : 80)).toLocaleString()
                }
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4 mb-6">
              <h4 className="text-lg font-semibold text-gray-800">Select Payment Method</h4>
              
              {/* Card Payment Option */}
              <div 
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'card' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'card' ? 'border-blue-500' : 'border-gray-400'
                  }`}>
                    {paymentMethod === 'card' && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">💳 Card Payment</p>
                    <p className="text-sm text-gray-600">Visa, MasterCard, RuPay</p>
                  </div>
                </div>
              </div>

              {/* UPI Payment Option */}
              <div 
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'upi' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                }`}
                onClick={() => setPaymentMethod('upi')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'upi' ? 'border-purple-500' : 'border-gray-400'
                  }`}>
                    {paymentMethod === 'upi' && (
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">📱 UPI Payment</p>
                    <p className="text-sm text-gray-600">PhonePe, Google Pay, Paytm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Validation Errors */}
            {showPaymentValidation && Object.keys(paymentValidationErrors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <h4 className="text-sm font-bold text-red-800 mb-1">Please complete payment details</h4>
                    <p className="text-sm text-red-600">All payment fields are required to proceed</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                  <input
                    type="text"
                    value={paymentFormData.cardNumber}
                    onChange={(e) => setPaymentFormData({...paymentFormData, cardNumber: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    data-testid="input-card-number"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      showPaymentValidation && paymentValidationErrors.cardNumber 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  />
                  {showPaymentValidation && paymentValidationErrors.cardNumber && (
                    <p className="text-red-500 text-sm mt-1">Card number is required</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      value={paymentFormData.expiryDate}
                      onChange={(e) => setPaymentFormData({...paymentFormData, expiryDate: e.target.value})}
                      placeholder="MM/YY"
                      data-testid="input-expiry-date"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        showPaymentValidation && paymentValidationErrors.expiryDate 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                    />
                    {showPaymentValidation && paymentValidationErrors.expiryDate && (
                      <p className="text-red-500 text-sm mt-1">Expiry date is required</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      value={paymentFormData.cvv}
                      onChange={(e) => setPaymentFormData({...paymentFormData, cvv: e.target.value})}
                      placeholder="123"
                      data-testid="input-cvv"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        showPaymentValidation && paymentValidationErrors.cvv 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                    />
                    {showPaymentValidation && paymentValidationErrors.cvv && (
                      <p className="text-red-500 text-sm mt-1">CVV is required</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={paymentFormData.cardholderName}
                    onChange={(e) => setPaymentFormData({...paymentFormData, cardholderName: e.target.value})}
                    placeholder="Enter name on card"
                    data-testid="input-cardholder-name"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      showPaymentValidation && paymentValidationErrors.cardholderName 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  />
                  {showPaymentValidation && paymentValidationErrors.cardholderName && (
                    <p className="text-red-500 text-sm mt-1">Cardholder name is required</p>
                  )}
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                  <input
                    type="text"
                    value={paymentFormData.upiId}
                    onChange={(e) => setPaymentFormData({...paymentFormData, upiId: e.target.value})}
                    placeholder="yourname@paytm"
                    data-testid="input-upi-id"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      showPaymentValidation && paymentValidationErrors.upiId 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  />
                  {showPaymentValidation && paymentValidationErrors.upiId && (
                    <p className="text-red-500 text-sm mt-1">UPI ID is required</p>
                  )}
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                  <p className="text-sm text-purple-700">
                    Enter your UPI ID (e.g., 9876543210@paytm, name@okaxis, etc.)
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                data-testid="button-cancel-payment"
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={validatePaymentAndProceed}
                data-testid="button-pay-now"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all font-medium"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {showOrderConfirmation && !orderSubmitted && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-2xl font-bold text-gray-800">Order Confirmation</h3>
              <p className="text-gray-600 mt-2">Please review your order details before submitting</p>
            </div>

            {/* Order Details */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6 border border-green-200">
              <h4 className="text-lg font-bold text-gray-800 mb-4">📋 Order Details</h4>
              
              <div className="space-y-3">
                {/* Bottle Details */}
                <div className="flex justify-between">
                  <span className="text-gray-700">Bottle Type:</span>
                  <span className="font-semibold">
                    {useMixedSelection ? 
                      `Mixed (${mixedBottles['750ml']} × 750ml + ${mixedBottles['1L']} × 1L)` :
                      `${quantity.toLocaleString()} × ${bottleSize}`
                    }
                  </span>
                </div>
                
                {/* Distribution */}
                <div className="flex justify-between">
                  <span className="text-gray-700">Distribution:</span>
                  <span className="font-semibold">
                    {selectedOption === 'inStores' && '🏪 In Stores'}
                    {selectedOption === 'yourLocation' && '🏢 At Your Location'}
                    {selectedOption === 'split' && '📍 Split Distribution'}
                  </span>
                </div>
                
                {/* Location */}
                <div className="flex justify-between">
                  <span className="text-gray-700">Location:</span>
                  <span className="font-semibold">
                    {selectedCity && selectedArea ? `${selectedArea}, ${selectedCity}` : 'Selected Location'}
                  </span>
                </div>
                
                {/* Design Status */}
                <div className="flex justify-between">
                  <span className="text-gray-700">Design:</span>
                  <span className="font-semibold">
                    {uploadedFile ? `📁 ${uploadedFile.name}` : '📝 Ready for upload'}
                  </span>
                </div>
                
                {/* Payment Method */}
                <div className="flex justify-between">
                  <span className="text-gray-700">Payment:</span>
                  <span className="font-semibold">
                    {paymentMethod === 'card' ? '💳 Card Payment' : '📱 UPI Payment'}
                  </span>
                </div>
                
                {/* Total */}
                <div className="border-t border-green-300 pt-3 mt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{useMixedSelection ? 
                        ((mixedBottles['750ml'] * 70) + (mixedBottles['1L'] * 80)).toLocaleString() :
                        (quantity * (bottleSize === '750ml' ? 70 : 80)).toLocaleString()
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Design Preview Delivery Options */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h4 className="text-lg font-semibold text-blue-800 mb-3">📱 Design Preview Delivery</h4>
              <p className="text-sm text-blue-700 mb-4">
                After order approval, your bottle design preview will be sent within <span className="font-bold">1-2 hours</span>
              </p>
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-blue-800">Choose delivery method for your design preview:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-50 transition-colors">
                    <input
                      type="radio"
                      name="confirmationPreviewDelivery"
                      value="whatsapp"
                      defaultChecked
                      className="w-4 h-4 text-blue-500 focus:ring-blue-500 focus:ring-2"
                      data-testid="radio-confirmation-whatsapp"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📱</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">WhatsApp</p>
                        <p className="text-xs text-gray-600">Quick delivery via message</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-50 transition-colors">
                    <input
                      type="radio"
                      name="confirmationPreviewDelivery"
                      value="email"
                      className="w-4 h-4 text-blue-500 focus:ring-blue-500 focus:ring-2"
                      data-testid="radio-confirmation-email"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📧</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Email</p>
                        <p className="text-xs text-gray-600">High-quality images via email</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowOrderConfirmation(false);
                  setShowPaymentModal(true);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                ← Back to Payment
              </button>
              <button
                onClick={async () => {
                  setShowOrderConfirmation(false);
                  setOrderSubmitted(true);
                  setCampaignSubmitted(true);
                  
                  // Prepare order data for submission
                  const campaignId = `BW${Date.now()}`;
                  const transactionId = `TXN${Date.now()}`;
                  const totalAmount = useMixedSelection ? 
                    ((mixedBottles['750ml'] * 70) + (mixedBottles['1L'] * 80)) :
                    (quantity * (bottleSize === '750ml' ? 70 : 80));
                  
                  const orderData = {
                    campaignId,
                    transactionId,
                    customerName: 'Customer Name', // This would come from user registration/form
                    email: 'customer@example.com', // This would come from user registration/form
                    phone: '+91 9876543210', // This would come from user registration/form
                    amount: totalAmount,
                    distributionOption: selectedOption === 'inStores' ? 'In Stores' : 
                                       selectedOption === 'yourLocation' ? 'At Your Location' : 
                                       'Split Distribution',
                    city: selectedCity || 'Chandigarh',
                    area: selectedArea || 'Sector 17',
                    paymentMethod: paymentMethod === 'card' ? 'Card Payment' : 'UPI Payment',
                    designFile: uploadedFile ? uploadedFile.name : 'Ready for upload',
                    orderSummary: JSON.stringify({
                      bottleType: useMixedSelection ? 
                        `Mixed (${mixedBottles['750ml']} × 750ml + ${mixedBottles['1L']} × 1L)` :
                        `${quantity.toLocaleString()} × ${bottleSize}`,
                      quantity: useMixedSelection ? (mixedBottles['750ml'] + mixedBottles['1L']) : quantity,
                      bottleSize: useMixedSelection ? 'Mixed' : bottleSize,
                      designUploaded: uploadedFile ? 'Yes' : 'No'
                    }),
                    address: JSON.stringify({
                      houseNumber: '123',
                      street: 'Main Street',
                      pincode: '160017'
                    }),
                    status: 'pending'
                  };
                  
                  try {
                    // Get saved email configuration
                    const savedEmailConfig = localStorage.getItem('billboardwalker_email_config');
                    const emailConfig = savedEmailConfig ? JSON.parse(savedEmailConfig) : null;
                    
                    // Submit order to backend with email notification
                    const response = await fetch('/api/order-campaigns', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        ...orderData,
                        emailConfig // Pass email config for sending confirmation email
                      })
                    });
                    
                    if (response.ok) {
                      const result = await response.json();

                      
                      // Save campaign data for tracking
                      const newCampaignData = {
                        id: result.id,
                        status: 'pending',
                        bottleType: useMixedSelection ? 
                          `Mixed (${mixedBottles['750ml']} × 750ml + ${mixedBottles['1L']} × 1L)` :
                          `${quantity.toLocaleString()} × ${bottleSize}`,
                        distribution: selectedOption === 'inStores' ? 'In Stores' : 
                                      selectedOption === 'yourLocation' ? 'At Your Location' : 
                                      'Split Distribution',
                        location: selectedCity && selectedArea ? `${selectedArea}, ${selectedCity}` : 'Tricity Area',
                        design: uploadedFile ? uploadedFile.name : 'Ready for upload',
                        paymentMethod: paymentMethod === 'card' ? 'Card Payment' : 'UPI Payment',
                        totalAmount,
                        submittedAt: new Date().toLocaleString(),
                        campaignId,
                        transactionId,
                        statusHistory: [
                          { status: 'pending', timestamp: new Date().toLocaleString(), message: 'Campaign submitted for review and confirmation email sent' }
                        ]
                      };
                      setCampaignData(newCampaignData);
                    } else {

                    }
                  } catch (error) {

                  }
                  
                  setTimeout(() => {
                    setDashboardTab('tracking');
                  }, 3000);
                  setTimeout(() => {
                    setOrderSubmitted(false);
                  }, 5000);
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium"
              >
                🚀 Submit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Submitted Success Modal */}
      {orderSubmitted && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Order Submitted Successfully!</h3>
              <p className="text-gray-600 mb-2">Your campaign has been submitted for review.</p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">📋</div>
                  <div>
                    <p className="text-lg font-semibold text-yellow-800">Approval Pending</p>
                    <p className="text-sm text-yellow-700">
                      Your campaign is under review. You'll be notified once approved.
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                Redirecting to Campaign Dashboard...
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}