import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [criticalFlowers, setCriticalFlowers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // تحديث البيانات كل 30 ثانية
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const [summaryRes, criticalRes, alertsRes] = await Promise.all([
        fetch(`${base}/api/dashboard/summary`),
        fetch(`${base}/api/dashboard/critical-flowers`),
        fetch(`${base}/api/dashboard/top-alerts`)
      ]);

      if (!summaryRes.ok || !criticalRes.ok || !alertsRes.ok) {
        throw new Error('فشل في جلب البيانات');
      }

      const summaryData = await summaryRes.json();
      const criticalData = await criticalRes.json();
      const alertsData = await alertsRes.json();

      setSummary(summaryData);
      setCriticalFlowers(criticalData);
      setAlerts(alertsData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('خطأ:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !summary) {
    return <div className="dashboard"><div className="loading">⏳ جاري التحميل...</div></div>;
  }

  if (error) {
    return <div className="dashboard"><div className="error">❌ خطأ: {error}</div></div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 لوحة التحكم</h1>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          🔄 تحديث البيانات
        </button>
      </div>

      {/* بطاقات الملخص */}
      <div className="summary-cards">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-label">إجمالي الأزهار</div>
            <div className="stat-value">{summary?.total_flowers || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">الكمية المتاحة</div>
            <div className="stat-value">{summary?.total_quantity || 0}</div>
          </div>
        </div>

        <div className="stat-card critical">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-label">تنبيهات حرجة</div>
            <div className="stat-value">{summary?.critical_alerts || 0}</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-label">قريبة من التلف</div>
            <div className="stat-value">{summary?.flowers_expiring_soon || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">الإيرادات اليوم</div>
            <div className="stat-value">{(summary?.total_revenue_today || 0).toFixed(2)}$</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">الإيرادات الشهر</div>
            <div className="stat-value">{(summary?.total_revenue_month || 0).toFixed(2)}$</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-content">
            <div className="stat-label">عناصر مخفضة</div>
            <div className="stat-value">{summary?.discounted_items || 0}</div>
          </div>
        </div>
      </div>

      {/* الأزهار القريبة من التلف */}
      <div className="card">
        <div className="card-title">⏰ أزهار قريبة من التلف</div>
        {criticalFlowers.length > 0 ? (
          <div className="critical-flowers-list">
            {criticalFlowers.slice(0, 5).map(flower => (
              <div key={flower.id} className={`flower-item priority-${flower.priority}`}>
                <div className="flower-info">
                  <div className="flower-name">{flower.name}</div>
                  <div className="flower-details">
                    <span>الكمية: {flower.quantity_current}</span>
                    <span>الوقت المتبقي: {flower.hours_remaining} ساعة</span>
                  </div>
                </div>
                <span className={`priority-badge priority-${flower.priority}`}>
                  {flower.priority}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">✅ لا توجد أزهار قريبة من التلف</div>
        )}
      </div>

      {/* التنبيهات */}
      <div className="card">
        <div className="card-title">🚨 أحدث التنبيهات</div>
        {alerts.length > 0 ? (
          <div className="alerts-list">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className={`alert-item severity-${alert.severity}`}>
                <div className="alert-content">
                  <div className="alert-title">{alert.flower_name}</div>
                  <div className="alert-message">{alert.message}</div>
                </div>
                <span className={`severity-badge severity-${alert.severity}`}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">✅ لا توجد تنبيهات</div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
