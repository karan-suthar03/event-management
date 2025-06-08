import React, { useState, useEffect } from 'react';
import { HiCog, HiOutlineTag, HiOutlineBell, HiSwatch, HiOutlineCheck, HiExclamationTriangle } from 'react-icons/hi2';
import apiService from '../utils/apiService';
import authService from '../utils/authService';

const AdminSettings = () => {
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [discountInput, setDiscountInput] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [discountSuccess, setDiscountSuccess] = useState(false);

  const [notifyOnRequest, setNotifyOnRequest] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  const [theme, setTheme] = useState('dark');
  const [themeLoading, setThemeLoading] = useState(false);
  const [themeSuccess, setThemeSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const discountData = await apiService.get('/api/global-discount', true);
        setGlobalDiscount(Number(discountData.discount) || 0);
        setDiscountInput(discountData.discount || '');
        setNotifyOnRequest(true);
        setEmailNotifications(false);
        setTheme('dark');
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleUpdateDiscount = async () => {
    setDiscountLoading(true);
    setDiscountError('');
    setDiscountSuccess(false);

    try {
      const discountToSend = discountInput === '' ? 0 : Number(discountInput);
      const response = await apiService.post('/api/global-discount', { discount: discountToSend }, true);
      
      setGlobalDiscount(Number(response.discount) || 0);
      setDiscountSuccess(true);
      
      setTimeout(() => setDiscountSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating discount:', error);
      setDiscountError('Failed to update global discount. Please try again.');
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleUpdateNotificationSettings = async () => {
    setNotificationLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setNotificationSuccess(true);
    setTimeout(() => setNotificationSuccess(false), 3000);
    
    setNotificationLoading(false);
  };

  const handleUpdateTheme = async (newTheme) => {
    setThemeLoading(true);
    setTheme(newTheme);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setThemeSuccess(true);
    setTimeout(() => setThemeSuccess(false), 3000);
    
    setThemeLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 md:p-8">
        <div className="flex items-center mb-8">
          <HiCog className="w-8 h-8 text-sky-400 mr-3" />
          <h1 className="text-3xl md:text-4xl font-bold text-sky-400">Admin Settings</h1>
        </div>
        <section className="mb-10 p-6 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="flex items-center mb-4">
            <HiOutlineTag className="w-6 h-6 text-sky-400 mr-2" />
            <h2 className="text-xl font-semibold text-sky-300">Global Discount</h2>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-md mb-4">
            <p className="text-slate-300 mb-2">
              Set a global discount percentage that will apply to all decoration packages, unless they have a specific discount set.
            </p>
            <p className="text-slate-400 text-sm">
              Current global discount: <span className="font-bold text-sky-400">{globalDiscount}%</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col">
              <label htmlFor="globalDiscount" className="block text-sm font-medium text-slate-300 mb-1">
                Discount Percentage (0-100)
              </label>
              <input
                type="number"
                id="globalDiscount"
                min={0}
                max={100}
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                className="w-32 px-3 py-2 rounded bg-slate-900 border border-slate-600 text-sky-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                disabled={discountLoading}
              />
            </div>
            <button
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-60 h-[42px]"
              onClick={handleUpdateDiscount}
              disabled={discountLoading}
            >
              {discountLoading ? "Updating..." : "Update Discount"}
            </button>
          </div>
          {discountError && (
            <div className="mt-2 text-red-400 flex items-center">
              <HiExclamationTriangle className="w-5 h-5 mr-1" />
              {discountError}
            </div>
          )}
          {discountSuccess && (
            <div className="mt-2 text-green-400 flex items-center">
              <HiOutlineCheck className="w-5 h-5 mr-1" />
              Global discount updated successfully!
            </div>
          )}
        </section>
        <section className="mb-10 p-6 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="flex items-center mb-4">
            <HiOutlineBell className="w-6 h-6 text-purple-400 mr-2" />
            <h2 className="text-xl font-semibold text-purple-300">Notification Preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyOnRequest"
                checked={notifyOnRequest}
                onChange={() => setNotifyOnRequest(!notifyOnRequest)}
                className="w-5 h-5 rounded border-slate-500 bg-slate-800 text-purple-500 focus:ring-purple-500"
              />
              <label htmlFor="notifyOnRequest" className="ml-2 text-slate-300">
                Show notifications for new decoration requests
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
                className="w-5 h-5 rounded border-slate-500 bg-slate-800 text-purple-500 focus:ring-purple-500"
              />
              <label htmlFor="emailNotifications" className="ml-2 text-slate-300">
                Receive email notifications (coming soon)
              </label>
            </div>
            <div className="pt-4">
              <button
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-60"
                onClick={handleUpdateNotificationSettings}
                disabled={notificationLoading}
              >
                {notificationLoading ? "Saving..." : "Save Preferences"}
              </button>
              {notificationSuccess && (
                <span className="ml-3 text-green-400 flex items-center">
                  <HiOutlineCheck className="w-5 h-5 mr-1" />
                  Preferences saved!
                </span>
              )}
            </div>
          </div>
        </section>
        <section className="p-6 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="flex items-center mb-4">
            <HiSwatch className="w-6 h-6 text-teal-400 mr-2" />
            <h2 className="text-xl font-semibold text-teal-300">Theme Settings</h2>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-md mb-4">
            <p className="text-slate-300">
              Choose a theme for the admin dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
              onClick={() => handleUpdateTheme('dark')}
              disabled={themeLoading}
            >
              Dark Theme
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                theme === 'light' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
              onClick={() => handleUpdateTheme('light')}
              disabled={themeLoading}
            >
              Light Theme (Coming Soon)
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                theme === 'custom' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
              onClick={() => handleUpdateTheme('custom')}
              disabled={themeLoading}
            >
              Custom Theme (Coming Soon)
            </button>
            {themeSuccess && (
              <span className="ml-3 text-green-400 flex items-center self-center">
                <HiOutlineCheck className="w-5 h-5 mr-1" />
                Theme updated!
              </span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminSettings;
