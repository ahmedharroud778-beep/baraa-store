import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { EstimateRequest, OrderRequest, City } from '../lib/api';
import { Calculator as CalculatorIcon, DollarSign, MapPin, CheckCircle, MessageCircle, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Calculator() {
  const { t, i18n } = useTranslation();
  const [cartUrl, setCartUrl] = useState('');
  const [cartTotal, setCartTotal] = useState('');
  // Delivery
  const [includeDelivery, setIncludeDelivery] = useState(false);
  const [city, setCity] = useState('');
  const mode = 'price';

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // Order confirmation
  const [contactMethodIntent, setContactMethodIntent] = useState<'whatsapp' | 'messenger' | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const [cities, setCities] = useState<City[]>([
    { id: 1, nameEn: 'Tripoli', nameAr: 'طرابلس' },
    { id: 2, nameEn: 'Benghazi', nameAr: 'بنغازي' },
    { id: 3, nameEn: 'Misrata', nameAr: 'مصراتة' },
    { id: 4, nameEn: 'Sebha', nameAr: 'سبها' },
    { id: 5, nameEn: 'Zawiya', nameAr: 'الزاوية' },
    { id: 6, nameEn: 'Beida', nameAr: 'البيضاء' },
    { id: 7, nameEn: 'Khoms', nameAr: 'الخمس' },
    { id: 8, nameEn: 'Zliten', nameAr: 'زليتن' }
  ]);

  useEffect(() => {
    console.log('Fetching live config...');
    api.getEstimateConfig().then((data) => {
      console.log('Config received:', data);
      if (data && data.cities && data.cities.length > 0) {
        setCities(data.cities);
      }
    }).catch(err => {
      console.error('Failed to fetch config, using defaults:', err);
    });
  }, []);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setOrderConfirmed(false);

    try {
      const request: EstimateRequest = { mode };

      if (cartUrl) request.cartUrl = cartUrl;

      if (cartTotal) request.cartTotal = parseFloat(cartTotal);

      if (includeDelivery && city) {
        request.city = city;
      }

      if (!request.cartTotal) {
        setError('Please provide the Cart Total in USD.');
        setLoading(false);
        return;
      }

      const response = await api.calculateEstimate(request);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to calculate estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionType: 'ask' | 'buy') => {
    if (!result || !contactMethodIntent) return;
    setLoading(true);

    // IMPORTANT: CHANGE THESE NUMBERS AND LINKS TO YOUR ACTUAL CONTACT DETAILS!
    const WHATSAPP_NUMBER = '21891'; // e.g., '218910000000' (Include country code)
    const MESSENGER_LINK = '61575598744755'; // Using numeric ID to open Messenger directly

    const openContactLink = async (text: string) => {
      if (contactMethodIntent === 'whatsapp') {
        window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      } else {
        // Use synchronous copy so it finishes before the new tab steals focus
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Failed to copy', err);
        }
        document.body.removeChild(textArea);

        const messengerUrl = MESSENGER_LINK.startsWith('http') ? MESSENGER_LINK : `https://m.me/${MESSENGER_LINK}`;
        window.location.href = messengerUrl;

        setTimeout(() => {
          alert('Order details copied to clipboard! Please paste them in the chat.');
        }, 100);
      }
    };

    try {
      if (actionType === 'buy') {
        const orderReq: OrderRequest = {
          orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          cartUrl: cartUrl || '',
          mode,
          city: includeDelivery ? city : undefined,
          contactMethod: contactMethodIntent,
          originalPrice: result.breakdown.originalPrice,
          convertedPrice: result.breakdown.convertedPrice,
          weightFee: result.breakdown.weightFee,
          deliveryFee: result.breakdown.deliveryFee,
          totalEstimated: result.estimatedTotal
        };
        const res = await api.createOrder(orderReq);
        setCreatedOrder(res);
        setOrderConfirmed(true);

        const text = `Hello! I would like to confirm my order.\nOrder ID: ${orderReq.orderId}\nTotal Estimated: ${result.estimatedTotal.toFixed(2)} LYD\nCart URL: ${cartUrl || 'Provided manually'}`;
        await openContactLink(text);
      } else {
        // Just asking
        const text = `Hello! I have a question about this estimate.\nTotal Estimated: ${result.estimatedTotal.toFixed(2)} LYD\nCart URL: ${cartUrl || 'Provided manually'}`;
        await openContactLink(text);
      }
      setContactMethodIntent(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process action.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectContact = (method: 'whatsapp' | 'messenger') => {
    const WHATSAPP_NUMBER = '21891'; // Changed to match your updated number
    const MESSENGER_LINK = '61575598744755'; // Using numeric ID to open Messenger directly

    if (method === 'whatsapp') {
      window.location.href = `https://wa.me/${WHATSAPP_NUMBER}`;
    } else {
      const messengerUrl = MESSENGER_LINK.startsWith('http') ? MESSENGER_LINK : `https://m.me/${MESSENGER_LINK}`;
      window.location.href = messengerUrl;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <CalculatorIcon className="w-12 h-12 text-pink-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('calculator.title')}</h1>
          <p className="text-gray-600 mb-6">{t('calculator.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Contact Us */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col justify-center lg:sticky lg:top-6 z-10">
            <div className="text-center mb-6">
              <MessageCircle className="w-12 h-12 text-pink-500 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('calculator.contactPrompt')}</h2>
              <p className="text-gray-600">Have questions or want to place an order without the calculator? Reach out to us directly!</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => handleDirectContact('whatsapp')} type="button" className="flex-1 flex justify-center items-center px-4 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-semibold text-lg border border-green-200 shadow-sm">
                <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
              </button>
              <button onClick={() => handleDirectContact('messenger')} type="button" className="flex-1 flex justify-center items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-semibold text-lg border border-blue-200 shadow-sm">
                <Send className="w-5 h-5 mr-2" /> Messenger
              </button>
            </div>
          </div>

          {/* Right Column: Calculator Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="bg-pink-50 border border-pink-100 p-4 rounded-lg mb-8 flex items-start gap-3">
              <span className="text-pink-500 text-xl">💡</span>
              <div>
                <p className="text-sm text-pink-900 font-medium mb-1">{t('calculator.hint')}</p>
                <p className="text-sm text-pink-800 leading-relaxed">
                  {t('calculator.hintText')}
                </p>
              </div>
            </div>

            <form onSubmit={handleCalculate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                  <span>{t('calculator.cartUrlLabel')}</span>
                  <span className="text-xs text-gray-500 font-normal">{t('calculator.cartUrlOptional')}</span>
                </label>
                <input
                  type="url"
                  value={cartUrl}
                  onChange={(e) => setCartUrl(e.target.value)}
                  placeholder={t('calculator.cartUrlPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                  <span>{t('calculator.cartTotalLabel')}</span>
                  <span className="text-xs text-pink-600 font-semibold">{t('calculator.cartTotalRequired')}</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cartTotal}
                    onChange={(e) => setCartTotal(e.target.value)}
                    placeholder={t('calculator.cartTotalPlaceholder')}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>


              <div className="pt-2 border-t border-gray-200">
                <label className="flex items-center space-x-3 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDelivery}
                    onChange={(e) => setIncludeDelivery(e.target.checked)}
                    className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <span className="text-gray-700 font-medium">{t('calculator.includeDelivery')}</span>
                </label>

                {includeDelivery && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('calculator.selectCity')}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                      <div 
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-pink-500 focus-within:border-transparent text-gray-900 bg-white cursor-pointer"
                        onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                      >
                        {city ? (
                          <span>{cities.find(c => c.nameEn === city)?.[i18n.language === 'ar' ? 'nameAr' : 'nameEn'] || city}</span>
                        ) : (
                          <span className="text-gray-500">{t('calculator.selectCityPlaceholder', 'Select a city')}</span>
                        )}
                      </div>
                      
                      {isCityDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {cities.map((c) => (
                            <div
                              key={c.id}
                              className="px-4 py-2 hover:bg-pink-50 cursor-pointer text-gray-900"
                              onClick={() => {
                                setCity(c.nameEn);
                                setIsCityDropdownOpen(false);
                              }}
                            >
                              {i18n.language === 'ar' ? c.nameAr : c.nameEn}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isCityDropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('calculator.calculatingBtn') : t('calculator.calculateBtn')}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {result && !orderConfirmed && (
              <div className="mt-6 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimate Result</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="font-medium">${result.breakdown.originalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Converted (LYD):</span>
                    <span className="font-medium">{result.breakdown.convertedPrice.toFixed(2)} LYD</span>
                  </div>
                  {includeDelivery && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span className="font-medium">{result.breakdown.deliveryFee.toFixed(2)} LYD</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-pink-600">
                        {result.estimatedTotal.toFixed(2)} LYD
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-6">
                  <p className="text-sm text-yellow-800 text-center">
                    ⚠️ This might not be the exact price 100% due to Shein coupons or discounts.
                  </p>
                </div>

                <div>
                  <p className="text-center font-medium text-gray-700 mb-3">Contact Us via:</p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setContactMethodIntent('whatsapp')}
                      disabled={loading}
                      className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
                    </button>
                    <button
                      onClick={() => setContactMethodIntent('messenger')}
                      disabled={loading}
                      className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      <Send className="w-5 h-5 mr-2" /> Messenger
                    </button>
                  </div>
                </div>
              </div>
            )}

            {orderConfirmed && createdOrder && (
              <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
                <p className="text-gray-600 mb-4">Your order ID is <span className="font-bold">{createdOrder.orderId}</span></p>
                <p className="text-sm text-gray-500">
                  You can use this ID in the Tracking page to check your order status.
                </p>
              </div>
            )}

            {/* Contact Intent Modal */}
            {contactMethodIntent && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">What would you like to do?</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleAction('buy')}
                      disabled={loading}
                      className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50"
                    >
                      Confirm & Buy Order
                    </button>
                    <button
                      onClick={() => handleAction('ask')}
                      disabled={loading}
                      className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Just Asking / Inquiry
                    </button>
                    <button
                      onClick={() => setContactMethodIntent(null)}
                      disabled={loading}
                      className="w-full text-gray-500 py-2 mt-2 font-medium hover:text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
