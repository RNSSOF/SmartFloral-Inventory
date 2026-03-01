import React, { useState, useEffect } from 'react';
import './FlowerInventory.css';

function FlowerInventory() {
  const [flowers, setFlowers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    supplier: '',
    quantity: '',
    original_price: '',
    expected_lifespan_days: '7'
  });

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

  const handleAddFlower = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/flowers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          original_price: parseFloat(formData.original_price),
          expected_lifespan_days: parseInt(formData.expected_lifespan_days)
        })
      });

      if (!res.ok) throw new Error('فشل في إضافة الوردة');

      setFormData({
        name: '',
        type: '',
        supplier: '',
        quantity: '',
        original_price: '',
        expected_lifespan_days: '7'
      });
      setShowAddForm(false);
      fetchFlowers();
    } catch (err) {
      alert('خطأ: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'fresh': { label: 'طازج', class: 'badge-fresh' },
      'warning': { label: 'تحذير', class: 'badge-warning' },
      'critical': { label: 'حرج', class: 'badge-critical' },
      'expired': { label: 'منتهي', class: 'badge-expired' }
    };
    const badge = badges[status] || badges['fresh'];
    return `${badge.label}`;
  };

  if (loading) return <div className="inventory"><div className="loading">⏳ جاري التحميل...</div></div>;

  return (
    <div className="inventory">
      <div className="inventory-header">
        <h1>📦 إدارة المخزون</h1>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '❌ إلغاء' : '➕ إضافة وردة'}
        </button>
      </div>

      {/* نموذج الإضافة */}
      {showAddForm && (
        <div className="card add-form">
          <div className="card-title">إضافة وردة جديدة</div>
          <form onSubmit={handleAddFlower}>
            <div className="form-row">
              <div className="form-group">
                <label>الاسم*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>نوع الوردة*</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  placeholder="مثال: وردة حمراء"
                  required
                />
              </div>
              <div className="form-group">
                <label>المورد*</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>الكمية*</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>السعر الأصلي ($)*</label>
                <input
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>عمر التلف المتوقع (أيام)*</label>
                <input
                  type="number"
                  value={formData.expected_lifespan_days}
                  onChange={(e) => setFormData({...formData, expected_lifespan_days: e.target.value})}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">✅ إضافة</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="alert alert-danger">❌ خطأ: {error}</div>}

      {/* جدول الأزهار */}
      {flowers.length > 0 ? (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>النوع</th>
                  <th>المورد</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>الحالة</th>
                  <th>أيام للتلف</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {flowers.map(flower => (
                  <tr key={flower.id}>
                    <td><strong>{flower.name}</strong></td>
                    <td>{flower.type}</td>
                    <td>{flower.supplier}</td>
                    <td>{flower.quantity_current}</td>
                    <td>${flower.original_price.toFixed(2)}</td>
                    <td><span className={`badge ${getStatusColor(flower.status)}`}>{getStatusBadge(flower.status)}</span></td>
                    <td>{flower.days_until_decay}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm">تعديل</button>
                      <button className="btn btn-danger btn-sm">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card"><div className="empty-state">📭 لا توجد أزهار في المخزون</div></div>
      )}
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    'fresh': 'badge-fresh',
    'warning': 'badge-warning',
    'critical': 'badge-critical',
    'expired': 'badge-expired'
  };
  return colors[status] || colors['fresh'];
}

export default FlowerInventory;
