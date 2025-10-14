// src/components/InventoryDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./InventoryDetails.css";

const InventoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInventoryItem = () => {
      try {
        const inventoryData = JSON.parse(localStorage.getItem('inventoryItems') || '[]');

        // Find by inventoryId or id (support legacy keys)
        const found = inventoryData.find(it =>
          (it.inventoryId && it.inventoryId === id) ||
          (it.id && it.id === id)
        );

        if (!found) {
          alert('Inventory item not found!');
          navigate('/inventory');
          return;
        }

        // Normalize fields for display
        const normalized = {
          inventoryId: found.inventoryId || found.id || id,
          name: found.name || found.itemName || found.productName || 'Unnamed Item',
          category: found.category || found.cat || 'Uncategorized',
          price: Number(found.price ?? found.unitPrice ?? 0),
          quantity: Number(found.quantity ?? found.qty ?? 0),
          expiryDate: found.expiryDate || found.expiry || null,
          description: found.description || found.desc || '',
          image: found.image || found.imageBase64 || null,
          supplier: found.supplier || found.vendor || '',
          minStockLevel: found.minStockLevel ?? found.minStock ?? 0,
          createdAt: found.createdAt || new Date().toISOString()
        };

        // derive computed values
        normalized.totalValue = normalized.price * (normalized.quantity || 0);
        // derive status
        if (normalized.quantity <= 0) normalized.status = 'Out of Stock';
        else if (normalized.minStockLevel && normalized.quantity <= normalized.minStockLevel) normalized.status = 'Low Stock';
        else normalized.status = 'In Stock';

        setItem(normalized);
      } catch (error) {
        console.error('Error loading inventory item:', error);
        alert('Error loading inventory item');
        navigate('/inventory');
      } finally {
        setLoading(false);
      }
    };

    loadInventoryItem();
  }, [id, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Low Stock':
        return '#dc3545';
      case 'In Stock':
        return '#10b981';
      case 'Out of Stock':
        return '#6b7280';
      default:
        return '#3b82f6';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const deleteItem = () => {
    if (!window.confirm('Delete this item?')) return;
    const list = JSON.parse(localStorage.getItem('inventoryItems') || '[]')
      .filter(i => (i.inventoryId || i.id) !== item.inventoryId);
    localStorage.setItem('inventoryItems', JSON.stringify(list));
    window.dispatchEvent(new Event('inventoryUpdated'));
    alert('Deleted');
    navigate('/inventory');
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = cart.findIndex(c => c.inventoryId === item.inventoryId);
    if (idx !== -1) cart[idx].quantity = Math.min(item.quantity, (cart[idx].quantity||0)+1);
    else cart.push({ inventoryId: item.inventoryId, name: item.name, price: item.price, quantity: 1, image: item.image, supplier: item.supplier || '' }); // include supplier
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    alert('Added to cart 🛒');
  };

  const buyNow = () => {
    addToCart();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="details-loading">
        <div className="spinner"></div>
        <p>Loading inventory details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="details-error">
        <h3>❌ Item Not Found</h3>
        <p>The requested inventory item could not be found.</p>
        <Link to="/inventory" className="btn btn-back">← Back to Inventory</Link>
      </div>
    );
  }

  // Add derived flag
  const isLowStock = item.minStockLevel && item.quantity <= item.minStockLevel && item.quantity > 0;

  return (
    <div className="inventory-details-container">
      <div className="details-header">
        <div className="header-left">
          <h1>📦 Inventory Item Details</h1>
          <div className="item-id">ID: {item.inventoryId}</div>
        </div>
        <div className="item-status" style={{ backgroundColor: getStatusColor(item.status) }}>
          {item.status}
        </div>
      </div>

      <div className="details-card">
        <div className="item-top">
          <div className="item-image-area">
            {item.image ? <img src={item.image} alt={item.name} /> : <div className="image-placeholder">No Image</div>}
          </div>

          <div className="item-summary">
            <h2 className="item-name">📛 {item.name}</h2>
            <div className="item-category">🏷️ {item.category}</div>
            <div className="item-supplier">🏢 {item.supplier || '—'}</div>
            <p className="item-desc">{item.description || 'No description provided.'}</p>

            <div className="summary-row">
              <div><strong>Unit Price</strong><div className="value">{formatCurrency(item.price)}</div></div>
              <div><strong>Quantity</strong><div className="value">{item.quantity}</div></div>
              <div><strong>Total Value</strong><div className="value">{formatCurrency(item.totalValue)}</div></div>
            </div>

            <div className="meta-row">
              <div><strong>Created</strong><div className="muted">{new Date(item.createdAt).toLocaleString()}</div></div>
              <div><strong>Min Stock</strong><div className="muted">{item.minStockLevel || '—'}</div></div>
              <div><strong>Expiry</strong><div className="muted">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'}</div></div>
            </div>
          </div>
        </div>

        {/* Low-stock banner */}
        {isLowStock && (
          <div style={{
            marginTop: 12,
            padding: '12px 16px',
            borderRadius: 8,
            background: 'linear-gradient(90deg, #fff4e5, #fff1cc)',
            color: '#92400e',
            border: '1px solid #f59e0b',
            fontWeight: 700
          }}>
            ⚠️ Low stock — only {item.quantity} left (threshold: {item.minStockLevel}). Please restock soon.
          </div>
        )}

        <div className="action-buttons">
          <Link to="/inventory" className="btn btn-back">← Back</Link>

          {user?.role === 'admin' ? (
            <>
             
            </>
          ) : (
            <>
              <button onClick={addToCart} className="btn btn-add-cart">🛒 Add to Cart</button>
              <button onClick={buyNow} className="btn btn-buy-now">💳 Buy Now</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryDetails;