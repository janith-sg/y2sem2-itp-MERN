// src/components/Orders.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Orders.css";

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = () => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      
      // Filter orders by current user (admin sees all, users see only their orders)
      const userOrders = user.role === 'admin' 
        ? allOrders 
        : allOrders.filter(order => 
            order.customerId === user.id || 
            order.customerId === user.email ||
            order.customerEmail === user.email
          );
      
      // Sort by creation date (newest first)
      const sortedOrders = userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setOrders(sortedOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
      setLoading(false);
    }
  };

  const toggle = (orderId) => {
    setExpanded(prev => prev === orderId ? null : orderId);
  };

  const formatCurrency = (amount) => {
    const n = Number(amount || 0);
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try { return new Date(dateString).toLocaleString(); } catch { return dateString; }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return '#ffc107';
      case 'shipped':
        return '#17a2b8';
      case 'delivered':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'failed':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h2>🧾 Past Orders</h2>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <p>No orders found.</p>
            <Link to="/inventory" className="btn btn-primary">Browse Inventory</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const orderTotal = (order.total != null)
                ? order.total
                : order.items.reduce((s, it) => s + ((it.purchasedQty || it.qty || 0) * Number(it.unitPrice || 0)), 0);

              return (
                <div key={order.orderId} className="order-card">
                  <div className="order-summary-row">
                    <div className="order-left">
                      <div className="order-id">Order <strong>{order.orderId}</strong></div>
                      <div className="order-date">{formatDate(order.createdAt)}</div>
                    </div>

                    <div className="order-right">
                      <div className="order-total">{formatCurrency(orderTotal)}</div>
                      <div className={`order-status ${order.status?.toLowerCase().replace(/\s/g,'-')}`}>{order.status || '—'}</div>
                      <button className="btn btn-secondary btn-sm" onClick={() => toggle(order.orderId)}>
                        {expanded === order.orderId ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {expanded === order.orderId && (
                    <div className="order-details">
                      <table className="order-items-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Supplier</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Line Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((it, i) => {
                            const qty = Number(it.purchasedQty ?? it.qty ?? 0);
                            const up = Number(it.unitPrice ?? it.price ?? 0);
                            return (
                              <tr key={i}>
                                <td className="td-name">{it.name}</td>
                                <td className="td-supplier">{it.supplier || '—'}</td>
                                <td className="td-qty">{qty}</td>
                                <td className="td-unit">{formatCurrency(up)}</td>
                                <td className="td-line">{formatCurrency(qty * up)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      <div className="order-meta">
                        <div><strong>Placed by:</strong> {order.userEmail || '—'}</div>
                        <div><strong>Created:</strong> {formatDate(order.createdAt)}</div>
                        <div><strong>Order Total:</strong> {formatCurrency(orderTotal)}</div>
                        <div><strong>Status:</strong> {order.status || '—'}</div>
                        {order.shipping && (
                          <div style={{ marginTop: 8 }}>
                            <strong>Shipping Address:</strong>
                            <div style={{ color:'#6b7280' }}>
                              {order.shipping.fullName}, {order.shipping.address1}{order.shipping.address2 ? `, ${order.shipping.address2}` : ''}, {order.shipping.city} {order.shipping.state} {order.shipping.zip}, {order.shipping.country}
                            </div>
                          </div>
                        )}
                        {order.paymentMask && (
                          <div style={{ marginTop: 6 }}>
                            <strong>Payment:</strong> <span style={{ color:'#6b7280' }}>{order.paymentMask}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;