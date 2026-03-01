import React, { useState, useEffect } from 'react';
import './Alerts.css';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
    // تحديث التنبيهات كل 15 ثانية
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/alerts');
      if (!res.ok) throw new Error('فشل في جلب التنبيهات');
      const data = await res.json();
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('خطأ:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/alerts/${alertId}/resolve`, {
        method: 'PUT'
      });
      if (!res.ok) throw new Error('فشل في حل التنبيه');
      fetchAlerts();
    } catch (err) {
      alert('خطأ: ' + err.message);
    }
  };

  if (loading && alerts.length === 0) {
    return <div className="alerts"><div className="loading">⏳ جاري التحميل...</div></div>;
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high');
  const otherAlerts = alerts.filter(a => a.severity !== 'critical' && a.severity !== 'high');

  return (
    <div className="alerts">
      <div className="alerts-header">
        <h1>🚨 التنبيهات</h1>
        <button className="btn btn-primary" onClick={fetchAlerts}>🔄 تحديث</button>
      </div>

      {error && <div className="alert alert-danger">❌ خطأ: {error}</div>}

      {/* التنبيهات الحرجة */}
      {criticalAlerts.length > 0 && (
        <div className="card critical-alerts-section">
          <div className="card-title">⚠️ تنبيهات حرجة ({criticalAlerts.length})</div>
          <div className="alerts-grid">
            {criticalAlerts.map(alert => (
              <div key={alert.id} className={`alert-card severity-${alert.severity}`}>
                <div className="alert-card-header">
                  <div className="alert-flower-name">{alert.flower_name}</div>
                  <span className={`severity-badge severity-${alert.severity}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <div className="alert-card-body">
                  <p className="alert-message">{alert.message}</p>
                  <div className="alert-details">
                    <span>نوع: {alert.alert_type}</span>
                    <span>الكمية: {alert.quantity_current}</span>
                  </div>
                </div>
                <div className="alert-card-footer">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleResolveAlert(alert.id)}
                  >
                    ✅ حل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* التنبيهات الأخرى */}
      {otherAlerts.length > 0 && (
        <div className="card">
          <div className="card-title">📢 تنبيهات أخرى ({otherAlerts.length})</div>
          <div className="alerts-list">
            {otherAlerts.map(alert => (
              <div key={alert.id} className={`alert-item severity-${alert.severity}`}>
                <div className="alert-info">
                  <div className="alert-flower-name">{alert.flower_name}</div>
                  <p className="alert-message">{alert.message}</p>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleResolveAlert(alert.id)}
                >
                  حل
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="card">
          <div className="empty-state">✅ لا توجد تنبيهات</div>
        </div>
      )}
    </div>
  );
}

export default Alerts;
