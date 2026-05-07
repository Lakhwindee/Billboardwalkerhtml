import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function QrScan() {
  const [, params] = useRoute("/qr/:token");
  const token = params?.token;
  const [claimed, setClaimed] = useState(false);
  const [userReward, setUserReward] = useState<any>(null);
  const [form, setForm] = useState({ phone: "", email: "", name: "" });
  const [scanned, setScanned] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/qr", token],
    queryFn: async () => {
      const res = await fetch(`/api/qr/${token}`);
      if (!res.ok) throw new Error("Invalid QR code");
      return res.json();
    },
    enabled: !!token,
  });

  const scanMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await fetch(`/api/qr/${token}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return res.json();
    },
    onSuccess: (result) => {
      setScanned(true);
      if (result.userReward) {
        setUserReward(result.userReward);
        setClaimed(true);
      }
    },
  });

  useEffect(() => {
    if (data && !scanned) {
      scanMutation.mutate({});
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="text-white text-center p-8">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Invalid QR Code</h1>
          <p className="text-gray-400">This QR code is not valid or has expired.</p>
        </div>
      </div>
    );
  }

  const { campaign, reward } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🍼</div>
          <h1 className="text-3xl font-bold text-white">IamBillBoard</h1>
          <p className="text-purple-200 text-sm">Custom Bottle Advertising</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-center">
            <h2 className="text-xl font-bold text-white">{campaign?.businessName || campaign?.title}</h2>
            <p className="text-purple-200 text-sm mt-1">{campaign?.title}</p>
          </div>

          <div className="p-6">
            {claimed && userReward ? (
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">You Won!</h3>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-500 mb-1">Your Reward</p>
                  <p className="text-xl font-bold text-purple-700">{userReward.reward?.title}</p>
                  <p className="text-gray-600 text-sm mt-1">{userReward.reward?.description}</p>
                  <div className="mt-3 bg-white rounded-lg p-3 border-2 border-dashed border-purple-300">
                    <p className="text-xs text-gray-500 mb-1">Redemption Code</p>
                    <p className="text-2xl font-mono font-bold text-purple-700 tracking-widest">{userReward.redemptionCode}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Valid till: {userReward.expiresAt ? new Date(userReward.expiresAt).toLocaleDateString('en-IN') : '30 days'}
                  </p>
                </div>
                <p className="text-sm text-gray-500">Show this code to claim your reward</p>
              </div>
            ) : reward ? (
              <div>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">🎁</div>
                  <h3 className="text-xl font-bold text-gray-800">Claim Your Reward!</h3>
                  <div className="bg-purple-50 rounded-xl p-3 mt-2">
                    <p className="font-bold text-purple-700">{reward.title}</p>
                    <p className="text-sm text-gray-600">{reward.rewardValue}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+91 XXXXX XXXXX"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <button
                    onClick={() => scanMutation.mutate(form)}
                    disabled={!form.phone || scanMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold text-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {scanMutation.isPending ? "Claiming..." : "🎁 Claim Reward"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Scan Recorded!</h3>
                <p className="text-gray-500 text-sm">Thank you for scanning this IamBillBoard bottle.</p>
                <div className="mt-4 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700">{campaign?.title}</p>
                  <p className="text-xs text-gray-400 mt-1">by {campaign?.businessName || 'IamBillBoard'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400">Powered by <span className="font-bold text-purple-600">IamBillBoard</span> · India's #1 Bottle Advertising Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
