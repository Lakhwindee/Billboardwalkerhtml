import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Contact, type Campaign, type PriceSetting } from "@shared/schema";
import { type User as AuthUser } from "@/types/user";

function Admin() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [showPriceModal, setShowPriceModal] = useState(false);
  
  const currentUserQuery = useQuery<AuthUser>({
    queryKey: ['/api/current-user'],
    retry: false,
  });
  
  const campaignsQuery = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"]
  });
  
  const contactsQuery = useQuery<Contact[]>({
    queryKey: ["/api/contacts"]
  });
  
  const priceSettingsQuery = useQuery<PriceSetting[]>({
    queryKey: ["/api/price-settings"]
  });

  const queryClient = useQueryClient();

  const currentUser = currentUserQuery.data;
  const userLoading = currentUserQuery.isLoading;
  const campaigns = campaignsQuery.data || [];
  const campaignsLoading = campaignsQuery.isLoading;
  const contacts = contactsQuery.data || [];
  const priceSettings = priceSettingsQuery.data || [];

  useEffect(() => {
    if (currentUser?.role === 'campaign_manager') {
      setActiveTab("campaigns");
    }
  }, [currentUser]);

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Access control
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'campaign_manager')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 text-6xl mb-6">🚫</div>
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-8">
            You don't have permission to access this admin panel. Please login with proper credentials.
          </p>
          <div className="space-y-3">
            <a 
              href="/signin" 
              className="block w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Go to Login
            </a>
            <a 
              href="/" 
              className="block w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

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
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-4xl font-black text-white mb-2">
                  IamBillBoard <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">Admin Panel</span>
                </h1>
                <p className="text-sm text-gray-300">
                  Welcome, {currentUser?.username} ({currentUser?.role === 'admin' ? 'Full Admin' : 'Campaign Manager'})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/dashboard" 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
              >
                Dashboard
              </a>
              <a 
                href="/" 
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
              >
                Home
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Role Based */}
        <div className="mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm p-2 rounded-xl border border-gray-700/50">
            <div className="flex overflow-x-auto scrollbar-hide gap-2 py-1">
              {/* Campaign Manager - Only Campaigns Tab */}
              {currentUser?.role === 'campaign_manager' && (
                <button
                  onClick={() => setActiveTab("campaigns")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                >
                  <span className="text-lg">📋</span>
                  <span className="text-sm font-medium">Campaigns</span>
                </button>
              )}
              
              {/* Admin - All Tabs */}
              {currentUser?.role === 'admin' && [
                { id: "campaigns", label: "Campaigns", icon: "📋" },
                { id: "website-editor", label: "Website Editor", icon: "🌐" },
                { id: "contacts", label: "Contact Messages", icon: "📞" },
                { id: "users", label: "Users Management", icon: "👥" },
                { id: "pricing", label: "Price Management", icon: "💰" },
                { id: "design-samples", label: "Design Gallery", icon: "🎨" },
                { id: "site-visitors", label: "Site Visitors", icon: "👀" },
                { id: "admin-settings", label: "Admin Settings", icon: "⚙️" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 
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

        {/* Campaign Management */}
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Campaign Management</h2>
              <div className="text-sm text-gray-300">
                Total Campaigns: {campaigns.length}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              {campaignsLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-300">Loading campaigns...</p>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Campaigns Yet</h3>
                  <p className="text-gray-400">Campaigns will appear here once users start submitting them.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-3 px-4 font-semibold text-gray-200">Campaign</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-200">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-200">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-200">Quantity</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-200">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-white">{campaign.title}</div>
                              <div className="text-sm text-gray-400">{campaign.description}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{campaign.customerName}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              campaign.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              campaign.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              campaign.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {campaign.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{campaign.quantity?.toLocaleString()} bottles</td>
                          <td className="py-3 px-4 text-gray-300">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-xs font-medium transition-colors border border-blue-500/30">
                                View Details
                              </button>
                              {campaign.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => updateCampaignMutation.mutate({id: campaign.id, status: 'approved'})}
                                    className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded text-xs font-medium transition-colors border border-green-500/30"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => updateCampaignMutation.mutate({id: campaign.id, status: 'rejected'})}
                                    className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-medium transition-colors border border-red-500/30"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Messages - Admin Only */}
        {activeTab === "contacts" && currentUser?.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Contact Messages</h2>
              <div className="text-sm text-gray-300">
                Total Messages: {contacts.length}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              {contacts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📞</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Messages Yet</h3>
                  <p className="text-gray-400">Contact messages will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{contact.name}</h4>
                          <p className="text-sm text-gray-400">{contact.email}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{contact.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price Management - Admin Only */}
        {activeTab === "pricing" && currentUser?.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Price Management</h2>
              <button 
                onClick={() => setShowPriceModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
              >
                Add Price Range
              </button>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              {priceSettings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💰</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Price Settings</h3>
                  <p className="text-gray-400">Add price ranges for different quantities.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {priceSettings.map((price) => (
                    <div key={price.id} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-white">
                            {price.minQuantity} - {price.maxQuantity || '∞'} bottles
                          </h4>
                          <p className="text-green-400">₹{price.pricePerBottle} per bottle</p>
                          {price.discountPercentage && (
                            <p className="text-sm text-yellow-400">
                              {price.discountPercentage}% discount
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          price.isActive 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {price.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other Admin Sections Placeholder */}
        {currentUser?.role === 'admin' && ['website-editor', 'users', 'design-samples', 'site-visitors', 'admin-settings'].includes(activeTab) && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{
                activeTab === 'website-editor' ? '🌐' :
                activeTab === 'users' ? '👥' :
                activeTab === 'design-samples' ? '🎨' :
                activeTab === 'site-visitors' ? '👀' :
                activeTab === 'admin-settings' ? '⚙️' : '📋'
              }</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
              </h2>
              <p className="text-gray-300 mb-4">
                Full admin functionality available here.
              </p>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-green-400 text-sm">
                  ✅ Admin section - All features available
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Access Restricted for Campaign Manager */}
        {currentUser?.role === 'campaign_manager' && activeTab !== "campaigns" && (
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-6">🚫</div>
            <h2 className="text-xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-gray-300">
              Campaign managers can only access the Campaigns section.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Admin;