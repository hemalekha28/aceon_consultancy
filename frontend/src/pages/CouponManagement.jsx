import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiAlertCircle, FiCheckCircle, FiTag, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { api } from '../utils/api';
import { formatPrice } from '../utils/helpers';

const CouponManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchase: '0',
        expiryDate: '',
        usageLimit: '',
        isActive: true
    });

    useEffect(() => {
        loadCoupons();
    }, []);

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification({ show: false, type: '', message: '' });
        }, 3000);
    };

    const loadCoupons = async () => {
        try {
            setLoading(true);
            const data = await api.getCoupons();
            setCoupons(data);
        } catch (error) {
            console.error('Error loading coupons:', error);
            showNotification('error', 'Failed to load coupons.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const couponData = {
                ...formData,
                discountValue: parseFloat(formData.discountValue),
                minPurchase: parseFloat(formData.minPurchase),
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
            };

            if (editingCoupon) {
                await api.updateCoupon(editingCoupon._id, couponData);
                showNotification('success', 'Coupon updated successfully!');
            } else {
                await api.addCoupon(couponData);
                showNotification('success', 'Coupon added successfully!');
            }

            await loadCoupons();
            resetForm();
        } catch (error) {
            console.error('Error saving coupon:', error);
            showNotification('error', error.message || 'Failed to save coupon.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue.toString(),
            minPurchase: coupon.minPurchase.toString(),
            expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
            usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
            isActive: coupon.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                await api.deleteCoupon(id);
                await loadCoupons();
                showNotification('success', 'Coupon deleted successfully!');
            } catch (error) {
                showNotification('error', 'Failed to delete coupon.');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discountType: 'percentage',
            discountValue: '',
            minPurchase: '0',
            expiryDate: '',
            usageLimit: '',
            isActive: true
        });
        setEditingCoupon(null);
        setShowModal(false);
    };

    return (
        <div className="container">
            {notification.show && (
                <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-danger'}`}
                    style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {notification.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                    {notification.message}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Coupon Management</h1>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    <FiPlus /> Add Coupon
                </button>
            </div>

            <div className="card">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center" style={{ padding: '2rem' }}>Loading...</div>
                    ) : coupons.length === 0 ? (
                        <div className="text-center" style={{ padding: '2rem' }}>No coupons found. Create your first one!</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Discount</th>
                                        <th>Min. Purchase</th>
                                        <th>Expires</th>
                                        <th>Usage</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.map((coupon) => (
                                        <tr key={coupon._id}>
                                            <td><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{coupon.code}</span></td>
                                            <td>
                                                {coupon.discountType === 'percentage'
                                                    ? `${coupon.discountValue}%`
                                                    : formatPrice(coupon.discountValue)}
                                            </td>
                                            <td>{formatPrice(coupon.minPurchase)}</td>
                                            <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                                            <td>{coupon.usedCount} / {coupon.usageLimit || '∞'}</td>
                                            <td>
                                                <span className={`badge ${coupon.isActive && new Date(coupon.expiryDate) > new Date() ? 'badge-success' : 'badge-danger'}`}>
                                                    {coupon.isActive && new Date(coupon.expiryDate) > new Date() ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleEdit(coupon)} className="btn btn-sm btn-secondary"><FiEdit /></button>
                                                    <button onClick={() => handleDelete(coupon._id)} className="btn btn-sm btn-danger"><FiTrash2 /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingCoupon ? 'Edit Coupon' : 'New Coupon'}</h3>
                            <button onClick={resetForm} className="modal-close">×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Coupon Code *</label>
                                    <input type="text" name="code" className="form-input" value={formData.code} onChange={handleInputChange} required style={{ textTransform: 'uppercase' }} />
                                </div>
                                <div className="grid grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Discount Type</label>
                                        <select name="discountType" className="form-select" value={formData.discountType} onChange={handleInputChange}>
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Value *</label>
                                        <input type="number" name="discountValue" className="form-input" value={formData.discountValue} onChange={handleInputChange} required min="0" />
                                    </div>
                                </div>
                                <div className="grid grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Min. Purchase</label>
                                        <input type="number" name="minPurchase" className="form-input" value={formData.minPurchase} onChange={handleInputChange} min="0" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Usage Limit</label>
                                        <input type="number" name="usageLimit" className="form-input" value={formData.usageLimit} onChange={handleInputChange} placeholder="Unlimited" min="1" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Expiry Date *</label>
                                    <input type="date" name="expiryDate" className="form-input" value={formData.expiryDate} onChange={handleInputChange} required min={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleInputChange} />
                                    <label htmlFor="isActive" style={{ margin: 0 }}>Is Active</label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Create Coupon')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponManagement;
