import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Contact, type Campaign, type PriceSetting, type BottleSample, type User, type UserProfile, type UserActivityLog, type LogoSetting, type DesignSample } from "@shared/schema";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";

function Admin() {
  // State declarations - all at top to avoid hooks order issues
  const [activeTab, setActiveTab] = useState("campaigns");
  
  // User authentication
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['/api/current-user'],
    retry: false,
  });

  // Campaign management
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignStatus, setCampaignStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const queryClient = useQueryClient();

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-red-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading admin panel...</div>
      </div>
    );
  }

  // Force campaigns tab for campaign manager
  useEffect(() => {
    if (currentUser?.role === 'campaign_manager') {
      setActiveTab("campaigns");
    }
  }, [currentUser]);

  // Fetch campaigns data
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"]
  });

  // Campaign status update mutation
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      return apiRequest("PATCH", `/api/campaigns/${id}`, { status, adminNotes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setShowCampaignModal(false);
      setSelectedCampaign(null);
      setCampaignStatus('');
      setRejectionReason('');
      toast({
        title: "Campaign Updated",
        description: "Campaign status has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update campaign status",
        variant: "destructive",
      });
    }
  });

  const handleUpdateCampaign = () => {
    if (!selectedCampaign || !campaignStatus) return;
    
    const notes = campaignStatus === 'rejected' ? rejectionReason : undefined;
    updateCampaignMutation.mutate({ 
      id: selectedCampaign.id, 
      status: campaignStatus, 
      notes 
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
      'in_production': 'bg-blue-100 text-blue-800 border-blue-200',
      'shipped': 'bg-purple-100 text-purple-800 border-purple-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-red-900">
      <div className="px-4 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {currentUser?.role === 'campaign_manager' ? 'Campaign Manager Panel' : 'Admin Panel'}
              </h1>
              <p className="text-gray-300">
                {currentUser?.role === 'campaign_manager' 
                  ? 'Manage and track advertising campaigns' 
                  : 'Administrative controls and management'
                }
              </p>
              <p className="text-sm text-purple-300 mt-1">Welcome, {currentUser?.username}</p>
            </div>
            <Link href="/signin" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all">
              Logout
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm p-2 rounded-xl border border-gray-700/50">
            <div className="flex gap-2">
              {/* Show only campaigns tab for campaign manager */}
              {currentUser?.role === 'campaign_manager' ? (
                <button
                  onClick={() => setActiveTab("campaigns")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                >
                  <span className="text-lg">📋</span>
                  <span className="text-sm font-medium">Campaigns</span>
                </button>
              ) : (
                // Show all tabs for admin
                <>
                  <button
                    onClick={() => setActiveTab("campaigns")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === "campaigns"
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <span className="text-lg">📋</span>
                    <span className="text-sm font-medium">Campaigns</span>
                  </button>
                  {/* Add other admin tabs here */}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Campaigns Content */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Campaign Management</h2>
            <div className="text-sm text-gray-300">
              Total: {campaigns.length} campaigns
            </div>
          </div>

          {campaignsLoading ? (
            <div className="text-center py-8">
              <div className="text-white">Loading campaigns...</div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-medium text-white mb-2">No campaigns found</h3>
              <p className="text-gray-400">Campaigns will appear here when submitted</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{campaign.campaignId}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-gray-300">Customer: {campaign.customerName}</p>
                      <p className="text-gray-400 text-sm">Submitted: {new Date(campaign.submittedAt).toLocaleDateString()}</p>
                      {campaign.adminNotes && (
                        <p className="text-gray-400 text-sm mt-1">Notes: {campaign.adminNotes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">₹{campaign.totalAmount?.toLocaleString() || '0'}</p>
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setCampaignStatus(campaign.status);
                          setShowCampaignModal(true);
                        }}
                        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campaign Management Modal */}
        {showCampaignModal && selectedCampaign && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Manage Campaign</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={campaignStatus}
                    onChange={(e) => setCampaignStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="in_production">In Production</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                {campaignStatus === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rejection Reason</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why this campaign was rejected..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCampaign}
                  disabled={updateCampaignMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {updateCampaignMutation.isPending ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;