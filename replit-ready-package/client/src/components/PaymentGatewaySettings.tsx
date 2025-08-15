import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { PaymentGatewaySetting } from '@shared/schema';

interface PaymentGatewayFormData {
  gateway: string;
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  isActive: boolean;
}

export default function PaymentGatewaySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewaySetting | null>(null);
  const [formData, setFormData] = useState<PaymentGatewayFormData>({
    gateway: 'razorpay',
    keyId: '',
    keySecret: '',
    webhookSecret: '',
    isActive: false
  });

  const { data: gateways = [], isLoading } = useQuery({
    queryKey: ['/api/payment-gateway-settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/payment-gateway-settings');
      return response.json();
    }
  });

  const createGatewayMutation = useMutation({
    mutationFn: async (data: PaymentGatewayFormData) => {
      const response = await apiRequest('POST', '/api/payment-gateway-settings', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-gateway-settings'] });
      toast({
        title: 'Success',
        description: 'Payment gateway configuration created successfully'
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create payment gateway configuration',
        variant: 'destructive'
      });
    }
  });

  const updateGatewayMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PaymentGatewayFormData> }) => {
      const response = await apiRequest('PUT', `/api/payment-gateway-settings/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-gateway-settings'] });
      toast({
        title: 'Success',
        description: 'Payment gateway configuration updated successfully'
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update payment gateway configuration',
        variant: 'destructive'
      });
    }
  });

  const activateGatewayMutation = useMutation({
    mutationFn: async (gateway: string) => {
      const response = await apiRequest('POST', '/api/payment-gateway-settings/activate', { gateway });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-gateway-settings'] });
      toast({
        title: 'Success',
        description: 'Payment gateway activated successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to activate payment gateway',
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      gateway: 'razorpay',
      keyId: '',
      keySecret: '',
      webhookSecret: '',
      isActive: false
    });
    setSelectedGateway(null);
    setIsEditing(false);
  };

  const handleEdit = (gateway: PaymentGatewaySetting) => {
    setSelectedGateway(gateway);
    setFormData({
      gateway: gateway.gateway,
      keyId: gateway.keyId || '',
      keySecret: gateway.keySecret || '',
      webhookSecret: gateway.webhookSecret || '',
      isActive: gateway.isActive
    });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.keyId.trim() || !formData.keySecret.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Key ID and Key Secret are required',
        variant: 'destructive'
      });
      return;
    }

    if (selectedGateway) {
      updateGatewayMutation.mutate({ id: selectedGateway.id, data: formData });
    } else {
      createGatewayMutation.mutate(formData);
    }
  };

  const handleActivate = (gateway: string) => {
    activateGatewayMutation.mutate(gateway);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-2">Loading payment gateways...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Gateway Settings</h2>
        <p className="text-gray-600 dark:text-gray-300">Configure your payment gateways for processing orders</p>
      </div>

      {/* Gateway Configuration Form */}
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {isEditing ? 'Edit Payment Gateway' : 'Add New Payment Gateway'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Gateway Provider *
              </label>
              <select
                value={formData.gateway}
                onChange={(e) => setFormData({ ...formData, gateway: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                disabled={isEditing}
                data-testid="select-gateway"
              >
                <option value="razorpay">Razorpay</option>
                <option value="payu">PayU</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Key ID / Public Key *
              </label>
              <input
                type="text"
                value={formData.keyId}
                onChange={(e) => setFormData({ ...formData, keyId: e.target.value })}
                placeholder="Enter your gateway key ID"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                data-testid="input-key-id"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Secret Key *
              </label>
              <input
                type="password"
                value={formData.keySecret}
                onChange={(e) => setFormData({ ...formData, keySecret: e.target.value })}
                placeholder="Enter your gateway secret key"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                data-testid="input-key-secret"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Webhook Secret (Optional)
              </label>
              <input
                type="password"
                value={formData.webhookSecret}
                onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
                placeholder="Enter webhook secret"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                data-testid="input-webhook-secret"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                data-testid="checkbox-active"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                Set as active gateway
              </label>
            </div>

            <div className="flex space-x-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  data-testid="button-cancel"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={createGatewayMutation.isPending || updateGatewayMutation.isPending}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-save"
              >
                {createGatewayMutation.isPending || updateGatewayMutation.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Gateway'
                  : 'Add Gateway'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Configured Gateways List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configured Gateways</h3>
        
        {gateways.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400">No payment gateways configured yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add a payment gateway above to start processing real payments
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gateways.map((gateway: PaymentGatewaySetting) => (
              <div
                key={gateway.id}
                className={`p-4 rounded-lg border-2 ${
                  gateway.isActive
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                }`}
                data-testid={`gateway-card-${gateway.gateway}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium capitalize text-gray-900 dark:text-white">
                    {gateway.gateway}
                  </h4>
                  {gateway.isActive && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  <p><strong>Key ID:</strong> {gateway.keyId ? `${gateway.keyId.substring(0, 8)}...` : 'Not set'}</p>
                  <p><strong>Secret:</strong> {gateway.keySecret ? '••••••••' : 'Not set'}</p>
                  <p><strong>Webhook:</strong> {gateway.webhookSecret ? 'Configured' : 'Not set'}</p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(gateway)}
                    className="flex-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                    data-testid={`button-edit-${gateway.gateway}`}
                  >
                    Edit
                  </button>
                  {!gateway.isActive && (
                    <button
                      onClick={() => handleActivate(gateway.gateway)}
                      disabled={activateGatewayMutation.isPending}
                      className="flex-1 px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors disabled:opacity-50"
                      data-testid={`button-activate-${gateway.gateway}`}
                    >
                      {activateGatewayMutation.isPending ? 'Activating...' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Setup Instructions</h4>
        <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <p><strong>Razorpay:</strong> Get API keys from Razorpay Dashboard → Account & Settings → API Keys</p>
          <p><strong>PayU:</strong> Get Merchant Key and Salt from PayU Dashboard → Settings → Account</p>
          <p><strong>Stripe:</strong> Get API keys from Stripe Dashboard → Developers → API Keys</p>
          <p className="mt-2 text-blue-700 dark:text-blue-200">
            <strong>Note:</strong> Only one gateway can be active at a time. Deactivate current gateway before activating another.
          </p>
        </div>
      </div>
    </div>
  );
}