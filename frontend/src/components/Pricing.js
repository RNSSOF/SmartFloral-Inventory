import React, { useState, useEffect } from 'react';
import './Pricing.css';

function Pricing() {
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFlower, setSelectedFlower] = useState(null);
  const [discount, setDiscount] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchFlowers();
  }, []);

  const fetchFlowers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/flowers');
      if (!res.ok) throw new Error('فشل في جلب البيانات');
      const data = await res.json();
      setFlowers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('خطأ:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    if (!selectedFlower || !discount) {
      alert('الرجاء اختيار وردة وإدخال نسبة الخصم');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/pricing/apply-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flower_id: selectedFlower.id,
          discount_percentage: parseFloat(discount),
          reason: reason || 'تسعير ديناميكي'
        })
      });

      if (!res.ok) throw new Error('فشل في تطبيق الخصم');

      alert('✅ تم تطبيق الخصم بنجاح');
      setDiscount('');
      setReason('');
      setSelectedFlower(null);
      fetchFlowers();
    } catch (err) {
      alert('خطأ: ' + err.message);
    }
  };

  const calculateNewPrice = (originalPrice, discountPercentage) => {
    return originalPrice * (1 - discountPercentage / 100);
  };

  if (loading) return <div className="pricing"><div className="loading">⏳ جاري التحميل...</div></div>;

  const discountedItems = flowers.filter(f => (f.discount_percentage || 0) > 0);

  return (
    <div className="pricing">
      <div className="pricing-header">
        <h1>💰 إدارة التسعير</h1>
        <div className="pricing-stats">
          <div className="stat">
            <span>إجمالي الأزهار:</span>
            <strong>{flowers.length}</strong>
          </div>
          <div className="stat">
            <span>مع خصم:</span>
            <strong className="text-warning">{discountedItems.length}</strong>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">❌ خطأ: {error}</div>}

      {/* نموذج تطبيق الخصم */}
      <div className="card discount-form-card">
        <div className="card-title">➕ تطبيق خصم جديد</div>
        <form onSubmit={handleApplyDiscount}>
          <div className="form-row">
            <div className="form-group">
              <label>اختر الوردة*</label>
              <select
                value={selectedFlower?.id || ''}
                onChange={(e) => {
                  const selected = flowers.find(f => f.id === e.target.value);
                  setSelectedFlower(selected);
                }}
                required
              >
                <option value="">-- اختر وردة --</option>
                {flowers.map(flower => (
                  <option key={flower.id} value={flower.id}>
                    {flower.name} - {flower.quantity_current} (${flower.original_price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>نسبة الخصم (%)*</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                min="0"
                max="100"
                step="1"
                required
              />
            </div>

            <div className="form-group">
              <label>السبب</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="">-- اختر السبب --</option>
                <option value="close_to_expiry">قريب من التلف</option>
                <option value="promotion">عرض ترويجي</option>
                <option value="stock_clearance">تصفية مخزون</option>
                <option value="other">آخر</option>
              </select>
            </div>
          </div>

          {selectedFlower && discount && (
            <div className="price-preview">
              <div className="preview-item">
                <span>السعر الأصلي:</span>
                <strong>${selectedFlower.original_price.toFixed(2)}</strong>
              </div>
              <div className="preview-item">
                <span>نسبة الخصم:</span>
                <strong className="text-warning">{discount}%</strong>
              </div>
              <div className="preview-item highlight">
                <span>السعر الجديد:</span>
                <strong>${calculateNewPrice(selectedFlower.original_price, parseFloat(discount)).toFixed(2)}</strong>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-success">✅ تطبيق الخصم</button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setDiscount('');
                setReason('');
                setSelectedFlower(null);
              }}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>

      {/* قائمة الأزهار ذات الخصم */}
      {discountedItems.length > 0 && (
        <div className="card">
          <div className="card-title">
            🏷️ الأزهار ذات الخصم ({discountedItems.length})
          </div>
          <div className="discounted-items">
            {discountedItems.map(flower => (
              <div key={flower.id} className="discounted-item">
                <div className="item-info">
                  <div className="item-name">{flower.name}</div>
                  <div className="item-details">
                    <span>المتاح: {flower.quantity_current}</span>
                    <span>•</span>
                    <span>للتلف: {flower.days_until_decay} أيام</span>
                  </div>
                </div>
                <div className="pricing-info">
                  <div className="price-old">
                    <span className="price-label">أصلي:</span>
                    <span className="price-value">${flower.original_price.toFixed(2)}</span>
                  </div>
                  <div className="price-new">
                    <span className="price-label">جديد:</span>
                    <span className="price-value">${flower.current_price.toFixed(2)}</span>
                  </div>
                  <div className="discount-badge">
                    -{flower.discount_percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {flowers.length > 0 && discountedItems.length === 0 && (
        <div className="card">
          <div className="empty-state">
            💰 لا توجد أزهار مع خصم حالياً
          </div>
        </div>
      )}
    </div>
  );
}

export default Pricing;
