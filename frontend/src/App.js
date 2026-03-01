import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import FlowerInventory from './components/FlowerInventory';
import Alerts from './components/Alerts';
import Pricing from './components/Pricing';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [serverStatus, setServerStatus] = useState(false);

  useEffect(() => {
    // فحص حالة الخادم عبر قاعدة URL مرنة
    const base = process.env.REACT_APP_API_URL || 'https://smartfloral-inventory.onrender.com';
    fetch(`${base}/api/health`)
      .then(res => res.json())
      .then(() => setServerStatus(true))
      .catch(() => setServerStatus(false));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🌸 SmartFloral Inventory</h1>
          <p>نظام إدارة مخزون ذكي للورد</p>
        </div>
        <div className="server-status">
          <span className={serverStatus ? 'status-online' : 'status-offline'}>
            {serverStatus ? '✅ متصل' : '❌ غير متصل'}
          </span>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 لوحة التحكم
        </button>
        <button
          className={activeTab === 'inventory' ? 'active' : ''}
          onClick={() => setActiveTab('inventory')}
        >
          📦 المخزون
        </button>
        <button
          className={activeTab === 'alerts' ? 'active' : ''}
          onClick={() => setActiveTab('alerts')}
        >
          🚨 التنبيهات
        </button>
        <button
          className={activeTab === 'pricing' ? 'active' : ''}
          onClick={() => setActiveTab('pricing')}
        >
          💰 التسعير
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'inventory' && <FlowerInventory />}
        {activeTab === 'alerts' && <Alerts />}
        {activeTab === 'pricing' && <Pricing />}
      </main>

      <footer className="app-footer">
        <p>SmartFloral Inventory v0.1.0 | جميع الحقوق محفوظة © 2024</p>
      </footer>
    </div>
  );
}

export default App;

