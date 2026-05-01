import { useState } from 'react';
import { api } from '../lib/api';
import { Search, Package, Clock, CheckCircle, Truck, MapPin } from 'lucide-react';

export default function Tracking() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const result = await api.getOrderByOrderId(orderId);
      setOrder(result);
    } catch (err) {
      setError('Order not found. Please check your order ID.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_confirmed':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'shipping_from_shein':
        return <Truck className="w-6 h-6 text-blue-500" />;
      case 'in_libya':
        return <MapPin className="w-6 h-6 text-purple-500" />;
      case 'on_the_way':
        return <Truck className="w-6 h-6 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not_confirmed':
        return 'Not Confirmed';
      case 'shipping_from_shein':
        return 'Shipping from Shein';
      case 'in_libya':
        return 'In Libya';
      case 'on_the_way':
        return 'On the way';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Search className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order ID to check status</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {order && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                {getStatusIcon(order.status)}
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-gray-900">{getStatusText(order.status)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium">{order.orderId}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Mode</p>
                  <p className="font-medium capitalize">{order.mode}</p>
                </div>
                {order.city && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">City</p>
                    <p className="font-medium capitalize">{order.city}</p>
                  </div>
                )}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {order.totalEstimated && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Estimated Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {order.totalEstimated.toFixed(2)} LYD
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
