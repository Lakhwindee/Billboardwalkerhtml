import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Eye, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Package, 
  CreditCard, 
  MapPin, 
  Calendar,
  Truck,
  Star,
  AlertCircle,
  Download,
  MessageSquare,
  Phone,
  ArrowLeft,
  Home,
  ShoppingCart
} from 'lucide-react';

interface Campaign {
  id: number;
  campaignId: string;
  customerName: string;
  email: string;
  phone: string;
  bottleType: string;
  quantity: number;
  designImageUrl: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export default function CampaignStudio() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  // Fetch user's campaigns
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['/api/campaigns/user'],
    retry: false,
  });

  // Test campaign data with various statuses
  const testCampaigns = [
    {
      id: 1,
      campaignId: "BW1754882400001",
      transactionId: "TXN1754882400001",
      email: "admin@test.com",
      phone: "+91 9876543210",
      customerName: "Admin User",
      city: "Chandigarh",
      area: "Sector 17",
      totalAmount: 35000,
      status: "pending",
      submittedAt: "2025-01-15T10:30:00Z",
      rejectionReason: null,
      bottleType: "1,000 × 750ml",
      distributionOption: "In Stores",
      paymentMethod: "UPI Payment",
      designFile: "brand-logo.png",
      address: { houseNumber: "123", street: "Main Street", pincode: "160017" }
    },
    {
      id: 2,
      campaignId: "BW1754882350002",
      transactionId: "TXN1754882350002",
      email: "admin@test.com", 
      phone: "+91 9876543210",
      customerName: "Admin User",
      city: "Delhi",
      area: "Connaught Place",
      totalAmount: 50000,
      status: "approved",
      submittedAt: "2025-01-10T14:20:00Z",
      rejectionReason: null,
      bottleType: "Mixed (500 × 750ml + 300 × 1L)",
      distributionOption: "Split Distribution",
      paymentMethod: "Card Payment",
      designFile: "company-branding.jpg",
      address: { houseNumber: "456", street: "CP Market", pincode: "110001" }
    },
    {
      id: 3,
      campaignId: "BW1754882300003",
      transactionId: "TXN1754882300003",
      email: "admin@test.com",
      phone: "+91 9876543210",
      customerName: "Admin User",
      city: "Mumbai",
      area: "Bandra West",
      totalAmount: 75000,
      status: "delivered",
      submittedAt: "2025-01-05T09:15:00Z",
      rejectionReason: null,
      bottleType: "1,500 × 1L",
      distributionOption: "At Your Location",
      paymentMethod: "Card Payment",
      designFile: "product-launch.png",
      address: { houseNumber: "789", street: "Hill Road", pincode: "400050" }
    },
    {
      id: 4,
      campaignId: "BW1754882250004",
      transactionId: "TXN1754882250004",
      email: "admin@test.com",
      phone: "+91 9876543210",
      customerName: "Admin User",
      city: "Bangalore",
      area: "Koramangala",
      totalAmount: 42000,
      status: "rejected",
      submittedAt: "2025-01-08T16:45:00Z",
      rejectionReason: "Design quality needs improvement. Please provide high-resolution logo and clear brand guidelines.",
      bottleType: "800 × 750ml",
      distributionOption: "In Stores",
      paymentMethod: "UPI Payment",
      designFile: "low-res-logo.jpg",
      address: { houseNumber: "101", street: "5th Block", pincode: "560095" }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'approved': return 'text-green-700 bg-green-100 border-green-300';
      case 'rejected': return 'text-red-700 bg-red-100 border-red-300';
      case 'in_production': return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'shipped': return 'text-purple-700 bg-purple-100 border-purple-300';
      case 'delivered': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'in_production': return 'In Production';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Completed';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your campaigns...</p>
        </div>
      </div>
    );
  }

  const campaignList = campaigns && campaigns.length > 0 ? campaigns : testCampaigns;
  const totalCampaigns = campaignList.length;
  const activeCampaigns = campaignList.filter(c => !['delivered', 'rejected'].includes(c.status)).length;
  const totalSpent = campaignList.reduce((sum, c) => sum + c.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header with Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <Link href="/checkout">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  New Campaign
                </button>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/">
                <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg">
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </button>
              </Link>
            </div>
          </div>
          
          {/* Main Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campaign Studio</h1>
              <p className="text-gray-600 mt-1">Manage and track your bottle advertising campaigns</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Campaigns</p>
                <p className="text-2xl font-bold text-blue-600">{totalCampaigns}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeCampaigns}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-purple-600">₹{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-6 py-4 font-medium ${
                selectedTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setSelectedTab('campaigns')}
              className={`px-6 py-4 font-medium ${
                selectedTab === 'campaigns'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              All Campaigns
            </button>
            <button
              onClick={() => setSelectedTab('analytics')}
              className={`px-6 py-4 font-medium ${
                selectedTab === 'analytics'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Star className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
          </div>
        </div>

        {/* Content based on selected tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {campaignList.filter(c => c.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">In Production</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {campaignList.filter(c => c.status === 'in_production').length}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Shipped</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {campaignList.filter(c => c.status === 'shipped').length}
                    </p>
                  </div>
                  <Truck className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Delivered</p>
                    <p className="text-3xl font-bold text-green-600">
                      {campaignList.filter(c => c.status === 'delivered').length}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* Recent Campaigns */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Recent Campaigns</h3>
              </div>
              <div className="divide-y">
                {campaignList.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(campaign.status)}`}>
                            {getStatusIcon(campaign.status)}
                            <span>{formatStatus(campaign.status)}</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{campaign.campaignId}</h4>
                          <p className="text-sm text-gray-500">
                            {campaign.bottleType}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">₹{campaign.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{new Date(campaign.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'campaigns' && (
          <div className="space-y-6">
            {campaignList.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Your campaigns will appear here</h3>
                <p className="text-gray-500 mb-6">Start by creating your first campaign in the design tab</p>
                <div className="flex justify-center items-center space-x-4">
                  <Link href="/dashboard">
                    <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Create New Campaign
                    </button>
                  </Link>
                  <Link href="/">
                    <button className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200">
                      <Home className="w-4 h-4 mr-2" />
                      Back to Homepage
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {campaignList.map((campaign) => (
                  <div key={campaign.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{campaign.campaignId}</h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(campaign.status)}`}>
                              {getStatusIcon(campaign.status)}
                              <span>{formatStatus(campaign.status)}</span>
                            </div>
                          </div>
                          <p className="text-gray-600">Customer: {campaign.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">₹{campaign.totalAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{campaign.paymentMethod}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Order Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span>{campaign.bottleType}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{new Date(campaign.submittedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CreditCard className="w-4 h-4 text-gray-400" />
                              <span className={`px-2 py-1 rounded text-xs ${campaign.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {campaign.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Contact Info</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{campaign.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span>{campaign.email}</span>
                            </div>
                            {campaign.address && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-xs">{campaign.address}, {campaign.city}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Status Updates</h4>
                          <div className="space-y-2 text-sm">
                            {campaign.status === 'rejected' && campaign.rejectionReason && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-800 font-medium">Rejection Reason:</p>
                                <p className="text-red-700 text-xs mt-1">{campaign.rejectionReason}</p>
                              </div>
                            )}
                            {campaign.trackingNumber && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-blue-800 font-medium">Tracking Number:</p>
                                <p className="text-blue-700 text-xs mt-1 font-mono">{campaign.trackingNumber}</p>
                              </div>
                            )}
                            {campaign.estimatedDelivery && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-green-800 font-medium">Est. Delivery:</p>
                                <p className="text-green-700 text-xs mt-1">{new Date(campaign.estimatedDelivery).toLocaleDateString()}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 pt-4 border-t flex space-x-3">
                        {campaign.designImageUrl && (
                          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <Download className="w-4 h-4 mr-2" />
                            Download Design
                          </button>
                        )}
                        {campaign.status === 'rejected' && (
                          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Package className="w-4 h-4 mr-2" />
                            Resubmit Campaign
                          </button>
                        )}
                        {campaign.trackingNumber && (
                          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                            <Truck className="w-4 h-4 mr-2" />
                            Track Shipment
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Campaign Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Success Rate</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approved</span>
                      <span className="text-sm font-medium">
                        {campaignList.filter(c => c.status === 'approved').length} / {campaignList.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${campaignList.length > 0 ? (campaignList.filter(c => c.status === 'approved').length / campaignList.length * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Average Order Value</h4>
                  <div className="text-3xl font-bold text-blue-600">
                    ₹{campaignList.length > 0 ? Math.round(totalSpent / campaignList.length).toLocaleString() : 0}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Per campaign</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Details Modal */}
        {selectedCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Campaign Details</h2>
                    <p className="text-sm text-gray-500">#{selectedCampaign.campaignId || selectedCampaign.id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Status */}
                <div className="mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCampaign.status)}`}>
                    {getStatusIcon(selectedCampaign.status)}
                    <span className="ml-2">{selectedCampaign.status.charAt(0).toUpperCase() + selectedCampaign.status.slice(1)}</span>
                  </span>
                </div>

                {/* Campaign Information Grid */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedCampaign.customerName || "Customer Name"}</p>
                      <p><span className="font-medium">Email:</span> {selectedCampaign.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedCampaign.phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Campaign Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Bottle Type:</span> {selectedCampaign.bottleType || "1000 × 750ml"}</p>
                      <p><span className="font-medium">Distribution:</span> {selectedCampaign.distributionOption || "In Stores"}</p>
                      <p><span className="font-medium">Design:</span> {selectedCampaign.designFile || "Uploaded"}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">City:</span> {selectedCampaign.city}</p>
                      <p><span className="font-medium">Area:</span> {selectedCampaign.area || "N/A"}</p>
                      <p><span className="font-medium">Address:</span> {selectedCampaign.address ? JSON.stringify(selectedCampaign.address) : "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Payment</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Method:</span> {selectedCampaign.paymentMethod}</p>
                      <p><span className="font-medium">Amount:</span> ₹{selectedCampaign.totalAmount.toLocaleString()}</p>
                      <p><span className="font-medium">Transaction ID:</span> {selectedCampaign.transactionId || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedCampaign.status === 'rejected' && selectedCampaign.rejectionReason && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-sm font-medium text-red-800 mb-2">Rejection Reason</h3>
                    <p className="text-sm text-red-700">{selectedCampaign.rejectionReason}</p>
                  </div>
                )}

                {/* Timeline */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Timeline</h3>
                  <p className="text-sm text-gray-600">
                    Submitted: {new Date(selectedCampaign.submittedAt || selectedCampaign.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedCampaign.status === 'rejected' && (
                    <Link href="/dashboard">
                      <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Resubmit Campaign
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}