import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { Settings, City } from '../../lib/api';
import { Save, DollarSign, Package, MapPin } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const [settingsResult, citiesResult] = await Promise.all([
        api.getSettings(token),
        api.getCities(token)
      ]);
      setSettings(settingsResult);
      setCities(citiesResult);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      await api.updateSettings(token, settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!settings) {
    return <div className="p-8">Failed to load settings</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Configure your shipping calculator</p>
        </div>

        <div className="space-y-6">
          {/* Exchange Rate */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-pink-600" />
              <h2 className="text-xl font-semibold">Exchange Rate</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                USD to LYD Rate
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.libyanRate}
                onChange={(e) =>
                  setSettings({ ...settings, libyanRate: parseFloat(e.target.value) })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Weight Fee */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-pink-600" />
              <h2 className="text-xl font-semibold">Weight Fee</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee per KG (LYD)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.perKgFee}
                onChange={(e) =>
                  setSettings({ ...settings, perKgFee: parseFloat(e.target.value) })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* City Fees */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-pink-600" />
              <h2 className="text-xl font-semibold">City Delivery Fees</h2>
            </div>
            <div className="space-y-4">
              {cities.map((city) => (
                <div key={city.id} className="flex items-center gap-4">
                  <span className="w-48 font-medium">{city.nameEn} ({city.nameAr})</span>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.cityFees[city.nameEn] || 0}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cityFees: { ...settings.cityFees, [city.nameEn]: parseFloat(e.target.value) || 0 }
                      })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">LYD</span>
                </div>
              ))}
              {cities.length === 0 && (
                <p className="text-gray-500">No cities added yet. Please go to Locations to add your cities first!</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
