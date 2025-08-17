// Backup of current admin component
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Contact, type Campaign, type PriceSetting, type BottleSample, type User, type UserProfile, type UserActivityLog, type LogoSetting, type DesignSample } from "@shared/schema";
import { type User as AuthUser } from "@/types/user";
import { toast } from "@/hooks/use-toast";

function AdminSimple() {
  const [activeTab, setActiveTab] = useState("campaigns");

  // Get current user from session for role-based access
  const { data: currentUser, isLoading: userLoading } = useQuery<AuthUser>({
    queryKey: ['/api/current-user'],
    retry: false,
  });

  // Loading state while user authentication is being checked
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

  // Redirect if user is not authenticated or doesn't have admin/campaign_manager role
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

  // Set default tab for campaign managers to campaigns only
  useEffect(() => {
    if (currentUser?.role === 'campaign_manager') {
      setActiveTab("campaigns");
    }
  }, [currentUser]);

  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"]
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
                  IamBillBoard <span className="gradient-text">Admin Panel</span>
                </h1>
                <p className="text-sm text-gray-300">
                  Welcome, {currentUser?.username} ({currentUser?.role})
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
              {[
                // Campaign Manager - ONLY campaigns tab
                ...(currentUser?.role === 'campaign_manager' ? [
                  { id: "campaigns", label: "Campaigns", icon: "📋", roles: ["campaign_manager"] }
                ] : []),
                
                // Admin - ALL tabs
                ...(currentUser?.role === 'admin' ? [
                  { id: "campaigns", label: "Campaigns", icon: "📋", roles: ["admin"] },
                  { id: "website-editor", label: "Website Editor", icon: "🌐", roles: ["admin"] },
                  { id: "contacts", label: "Contact Messages", icon: "📞", roles: ["admin"] },
                  { id: "users", label: "Users Management", icon: "👥", roles: ["admin"] },
                  { id: "pricing", label: "Price Management", icon: "💰", roles: ["admin"] },
                  { id: "admin-settings", label: "Admin Settings", icon: "⚙️", roles: ["admin"] }
                ] : [])
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
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Campaign Management</h2>
              <div className="text-sm text-gray-300">
                Total Campaigns: {campaigns.length}
              </div>
            </div>

            {/* Campaigns Table */}
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
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              campaign.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              campaign.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              campaign.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{campaign.quantity}</td>
                          <td className="py-3 px-4 text-gray-300">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-xs transition-colors">
                                View
                              </button>
                              <button className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded text-xs transition-colors">
                                Approve
                              </button>
                              <button className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs transition-colors">
                                Reject
                              </button>
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

        {/* Admin-only tabs - Show message if campaign manager tries to access */}
        {currentUser?.role === 'campaign_manager' && activeTab !== "campaigns" && (
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-6">🚫</div>
            <h2 className="text-xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-gray-300">
              Campaign managers can only access the Campaigns section.
            </p>
          </div>
        )}

        {/* Other admin tabs placeholder */}
        {currentUser?.role === 'admin' && activeTab !== "campaigns" && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">{
                activeTab === 'website-editor' ? '🌐' :
                activeTab === 'contacts' ? '📞' :
                activeTab === 'users' ? '👥' :
                activeTab === 'pricing' ? '💰' :
                activeTab === 'admin-settings' ? '⚙️' : '📋'
              }</div>
              <h2 className="text-xl font-bold text-white mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
              </h2>
              <p className="text-gray-300">
                This section is available for full admin access.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSimple;