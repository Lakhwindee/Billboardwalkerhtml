import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AdvertiserAnalytics() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [qrCount, setQrCount] = useState(10);
  const [showQrModal, setShowQrModal] = useState(false);
  const [rewardForm, setRewardForm] = useState({ title: "", description: "", rewardType: "discount", rewardValue: "", totalAvailable: 100 });
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "qrcodes" | "scans" | "rewards" | "bottles">("overview");

  const token = localStorage.getItem("auth_token");
  const headers: any = token ? { Authorization: `Bearer ${token}` } : {};

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["/api/advertiser/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/advertiser/analytics", { headers });
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/campaigns", selectedCampaign, "analytics"],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${selectedCampaign}/analytics`, { headers });
      return res.json();
    },
    enabled: !!selectedCampaign,
  });

  const { data: qrCodes = [] } = useQuery({
    queryKey: ["/api/campaigns", selectedCampaign, "qr-codes"],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${selectedCampaign}/qr-codes`, { headers });
      return res.json();
    },
    enabled: !!selectedCampaign,
  });

  const { data: bottleAssignments = [] } = useQuery({
    queryKey: ["/api/campaigns", selectedCampaign, "bottle-assignments"],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${selectedCampaign}/bottle-assignments`, { headers });
      return res.json();
    },
    enabled: !!selectedCampaign,
  });

  const generateQrMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/campaigns/${selectedCampaign}/generate-qr`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qrCount }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: `✅ ${data.generated} QR codes generated!` });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", selectedCampaign, "qr-codes"] });
      setShowQrModal(false);
    },
  });

  const createRewardMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/campaigns/${selectedCampaign}/rewards`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(rewardForm),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Reward created!" });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", selectedCampaign, "analytics"] });
      setShowRewardForm(false);
      setRewardForm({ title: "", description: "", rewardType: "discount", rewardValue: "", totalAvailable: 100 });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totalScansAll = campaigns.reduce((s: number, c: any) => s + (c.totalScans || 0), 0);
  const totalQrAll = campaigns.reduce((s: number, c: any) => s + (c.totalQrCodes || 0), 0);
  const totalRewardsAll = campaigns.reduce((s: number, c: any) => s + (c.rewardsClaimed || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <button className="text-gray-500 hover:text-gray-700 flex items-center space-x-1 text-sm">
                <span>←</span><span>Dashboard</span>
              </button>
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              📊 Advertiser Analytics
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Campaigns", value: campaigns.length, icon: "📢", color: "purple" },
            { label: "QR Codes Generated", value: totalQrAll, icon: "📱", color: "blue" },
            { label: "Total Scans", value: totalScansAll, icon: "👁️", color: "green" },
            { label: "Rewards Claimed", value: totalRewardsAll, icon: "🎁", color: "pink" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="font-bold text-gray-800 mb-3">Your Campaigns</h2>
              {campaigns.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-sm">No campaigns yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {campaigns.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCampaign(c.id); setActiveTab("overview"); }}
                      className={`w-full text-left px-3 py-3 rounded-lg border transition-all ${selectedCampaign === c.id ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"}`}
                    >
                      <p className="font-medium text-gray-800 text-sm truncate">{c.title}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-gray-500">📱 {c.totalQrCodes} QRs</span>
                        <span className="text-xs text-gray-500">👁️ {c.totalScans} scans</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${c.status === "approved" ? "bg-green-100 text-green-700" : c.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                        {c.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Campaign Detail */}
          <div className="lg:col-span-2">
            {!selectedCampaign ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
                <div className="text-5xl mb-3">📊</div>
                <p className="font-medium">Select a campaign to view analytics</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 overflow-x-auto">
                  {(["overview", "qrcodes", "scans", "rewards", "bottles"] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? "border-purple-500 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                      {{ overview: "📊 Overview", qrcodes: "📱 QR Codes", scans: "👁️ Scans", rewards: "🎁 Rewards", bottles: "🍼 Bottles" }[tab]}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {/* Overview Tab */}
                  {activeTab === "overview" && analytics && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "QR Codes", value: analytics.totalQrCodes, icon: "📱" },
                          { label: "Total Scans", value: analytics.totalScans, icon: "👁️" },
                          { label: "Mobile Scans", value: analytics.mobileScans, icon: "📱" },
                          { label: "Rewards Claimed", value: analytics.rewardsClaimed, icon: "🎁" },
                        ].map(s => (
                          <div key={s.label} className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-xl">{s.icon}</div>
                            <div className="text-xl font-bold text-gray-800">{s.value}</div>
                            <div className="text-xs text-gray-500">{s.label}</div>
                          </div>
                        ))}
                      </div>
                      {/* Scan engagement rate */}
                      {analytics.totalQrCodes > 0 && (
                        <div className="bg-purple-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-purple-700 mb-2">Engagement Rate</p>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-purple-200 rounded-full h-3">
                              <div className="bg-purple-600 h-3 rounded-full" style={{ width: `${Math.min(100, (analytics.totalScans / analytics.totalQrCodes) * 100)}%` }} />
                            </div>
                            <span className="text-sm font-bold text-purple-700">
                              {analytics.totalQrCodes > 0 ? Math.round((analytics.totalScans / analytics.totalQrCodes) * 100) : 0}%
                            </span>
                          </div>
                          <p className="text-xs text-purple-500 mt-1">{analytics.totalScans} scans from {analytics.totalQrCodes} QR codes</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* QR Codes Tab */}
                  {activeTab === "qrcodes" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-500">{qrCodes.length} QR codes total</p>
                        <button onClick={() => setShowQrModal(true)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
                          + Generate QR Codes
                        </button>
                      </div>
                      {qrCodes.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <div className="text-4xl mb-2">📱</div>
                          <p className="text-sm">No QR codes yet. Generate some!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                          {qrCodes.map((qr: any) => (
                            <div key={qr.id} className="border border-gray-200 rounded-lg p-3 text-center">
                              {qr.qrImageUrl && <img src={qr.qrImageUrl} alt="QR" className="w-20 h-20 mx-auto mb-2" />}
                              <p className="text-xs font-mono text-gray-600 truncate">{qr.bottleSerial}</p>
                              <p className="text-xs text-gray-400">Scans: {qr.totalScans}</p>
                              <a href={qr.landingUrl} target="_blank" rel="noreferrer" className="text-xs text-purple-600 hover:underline">Preview →</a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scans Tab */}
                  {activeTab === "scans" && analytics && (
                    <div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <div className="text-xl font-bold text-blue-700">{analytics.mobileScans}</div>
                          <div className="text-xs text-blue-500">📱 Mobile</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <div className="text-xl font-bold text-green-700">{analytics.desktopScans}</div>
                          <div className="text-xs text-green-500">💻 Desktop</div>
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-700 mb-2 text-sm">Recent Scans</h3>
                      {analytics.recentScans?.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm">No scans yet</div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {analytics.recentScans?.map((scan: any) => (
                            <div key={scan.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                              <div>
                                <p className="text-xs font-medium text-gray-700">{scan.scannerDevice || "Unknown"}</p>
                                <p className="text-xs text-gray-400">{scan.claimedByPhone || scan.claimedByEmail || "Anonymous"}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">{new Date(scan.scannedAt).toLocaleDateString('en-IN')}</p>
                                {scan.rewardClaimed && <span className="text-xs text-green-600">🎁 Claimed</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rewards Tab */}
                  {activeTab === "rewards" && analytics && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-500">{analytics.rewards?.length} rewards</p>
                        <button onClick={() => setShowRewardForm(!showRewardForm)}
                          className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700">
                          + Add Reward
                        </button>
                      </div>
                      {showRewardForm && (
                        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 mb-4 space-y-3">
                          <h3 className="font-medium text-pink-700">New Reward</h3>
                          <input type="text" placeholder="Reward title (e.g. 10% Off)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={rewardForm.title} onChange={e => setRewardForm({ ...rewardForm, title: e.target.value })} />
                          <input type="text" placeholder="Description" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={rewardForm.description} onChange={e => setRewardForm({ ...rewardForm, description: e.target.value })} />
                          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={rewardForm.rewardType} onChange={e => setRewardForm({ ...rewardForm, rewardType: e.target.value })}>
                            <option value="discount">Discount</option>
                            <option value="freebie">Freebie</option>
                            <option value="cashback">Cashback</option>
                            <option value="points">Points</option>
                          </select>
                          <input type="text" placeholder="Reward value (e.g. 10%, ₹50)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={rewardForm.rewardValue} onChange={e => setRewardForm({ ...rewardForm, rewardValue: e.target.value })} />
                          <input type="number" placeholder="Total available (0 = unlimited)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={rewardForm.totalAvailable} onChange={e => setRewardForm({ ...rewardForm, totalAvailable: parseInt(e.target.value) })} />
                          <button onClick={() => createRewardMutation.mutate()} disabled={!rewardForm.title || createRewardMutation.isPending} className="w-full bg-pink-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                            {createRewardMutation.isPending ? "Creating..." : "Create Reward"}
                          </button>
                        </div>
                      )}
                      {analytics.rewards?.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm"><div className="text-3xl mb-2">🎁</div>No rewards yet</div>
                      ) : (
                        <div className="space-y-2">
                          {analytics.rewards?.map((r: any) => (
                            <div key={r.id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                              <div>
                                <p className="font-medium text-sm text-gray-800">{r.title}</p>
                                <p className="text-xs text-gray-500">{r.rewardType} · {r.rewardValue}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-600">{r.totalClaimed}/{r.totalAvailable === 0 ? "∞" : r.totalAvailable} claimed</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${r.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{r.isActive ? "Active" : "Inactive"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bottles Tab */}
                  {activeTab === "bottles" && (
                    <div>
                      <p className="text-sm text-gray-500 mb-4">{bottleAssignments.length} bottles assigned</p>
                      {bottleAssignments.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <div className="text-4xl mb-2">🍼</div>
                          <p className="text-sm">Generate QR codes to auto-assign bottles</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {bottleAssignments.map((b: any) => (
                            <div key={b.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                              <div>
                                <p className="text-sm font-medium text-gray-700">{b.bottleSerial}</p>
                                <p className="text-xs text-gray-400">{b.bottleType} · {b.distributionLocation || "No location"}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${b.status === "distributed" ? "bg-green-100 text-green-700" : b.status === "assigned" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                                {b.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 mb-4">Generate QR Codes</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">How many QR codes?</label>
              <input type="number" min={1} max={500} value={qrCount} onChange={e => setQrCount(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              <p className="text-xs text-gray-400 mt-1">Max 500 per batch</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setShowQrModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={() => generateQrMutation.mutate()} disabled={generateQrMutation.isPending}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {generateQrMutation.isPending ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
