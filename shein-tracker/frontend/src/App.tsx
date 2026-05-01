import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Calculator from './pages/Calculator';
import Tracking from './pages/Tracking';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminSettings from './pages/admin/Settings';
import AdminLocations from './pages/admin/Locations';
import AdminClothing from './pages/admin/Clothing';
import { Calculator as CalculatorIcon, Search, Settings, LogOut, Globe, MapPin, Package } from 'lucide-react';

function Navbar() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <nav className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold">Admin Panel</span>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2 hover:text-pink-400 transition-colors"
            >
              <Search className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              to="/admin/locations"
              className="flex items-center gap-2 hover:text-pink-400 transition-colors"
            >
              <MapPin className="w-5 h-5" />
              Locations
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center gap-2 hover:text-pink-400 transition-colors"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login';
              }}
              className="flex items-center gap-2 hover:text-pink-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-pink-600">Shein Tracker</span>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/' ? 'bg-pink-100 text-pink-600' : 'hover:bg-gray-100'
            }`}
          >
            <CalculatorIcon className="w-5 h-5" />
            Calculator
          </Link>
          <Link
            to="/tracking"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/tracking' ? 'bg-pink-100 text-pink-600' : 'hover:bg-gray-100'
            }`}
          >
            <Search className="w-5 h-5" />
            Tracking
          </Link>
        </div>
      </div>
    </nav>
  );
}

function LanguageModal({ onSelect }: { onSelect: (lang: string) => void }) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <Globe className="w-16 h-16 text-pink-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('modal.languageTitle', 'Choose your language')}</h2>
        <div className="space-y-4">
          <button
            onClick={() => onSelect('en')}
            className="w-full bg-gray-50 border-2 border-gray-200 text-gray-800 py-4 px-6 rounded-xl font-semibold text-lg hover:border-pink-500 hover:bg-pink-50 transition-all"
          >
            {t('modal.english', 'English')}
          </button>
          <button
            onClick={() => onSelect('ar')}
            className="w-full bg-gray-50 border-2 border-gray-200 text-gray-800 py-4 px-6 rounded-xl font-semibold text-lg hover:border-pink-500 hover:bg-pink-50 transition-all font-arabic"
            dir="rtl"
          >
            {t('modal.arabic', 'العربية')}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { i18n } = useTranslation();
  const [showLangModal, setShowLangModal] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (!savedLang) {
      setShowLangModal(true);
    } else {
      applyLanguage(savedLang);
    }
  }, []);

  const applyLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleLanguageSelect = (lang: string) => {
    localStorage.setItem('preferredLanguage', lang);
    applyLanguage(lang);
    setShowLangModal(false);
  };

  return (
    <Router>
      {showLangModal && <LanguageModal onSelect={handleLanguageSelect} />}
      <Navbar />
      <Routes>
        <Route path="/" element={<Calculator />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/locations" element={<AdminLocations />} />
      </Routes>
    </Router>
  );
}

export default App;
