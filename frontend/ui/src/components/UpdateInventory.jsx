// src/components/UpdateInventory.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./UpdateInventory.css";

const categories = [
  "Pet Food & Treats",
  "Health & Wellness",
  "Toys & Entertainment",
  "Grooming & Hygiene",
  "Accessories",
  "Habitat & Comfort",
  "Training Essentials"
];

const noExpiry = new Set(["Toys & Entertainment","Grooming & Hygiene","Accessories","Habitat & Comfort"]);

const UpdateInventory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);

  // Helper function to display ID with spaces for UI
  // replace brittle I- formatting with a generic readable format
  const displayId = (iid) => {
    if (!iid) return "";
    // e.g. INV-001 -> INV - 001 for visual clarity
    return iid.includes("-") ? iid.replace("-", " - ") : iid;
  };

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      alert('Only administrators can edit inventory items.');
      navigate('/inventory');
      return;
    }

    // Load inventory item data
    const loadInventoryItem = () => {
      try {
        const inventoryItems = JSON.parse(localStorage.getItem('inventoryItems') || '[]');
        const foundItem = inventoryItems.find(item => (item.inventoryId && item.inventoryId === id) || (item.id && item.id === id));
        
        if (foundItem) {
          setForm({
            inventoryId: foundItem.inventoryId || foundItem.id || id,
            name: foundItem.name || foundItem.itemName || "",
            category: foundItem.category || "",
            price: foundItem.price ?? foundItem.unitPrice ?? 0,
            quantity: foundItem.quantity ?? foundItem.qty ?? 0,
            minStockLevel: foundItem.minStockLevel ?? foundItem.minStock ?? 0, // NEW
            expiryDate: foundItem.expiryDate || foundItem.expiry || "",
            description: foundItem.description || foundItem.desc || "",
            image: foundItem.image || foundItem.imageBase64 || null,
            supplier: foundItem.supplier || "" // NEW supplier prefilling
          });
        } else {
          alert('Inventory item not found!');
          navigate('/inventory');
        }
      } catch (error) {
        console.error('Error loading inventory item:', error);
        alert('Error loading inventory item');
        navigate('/inventory');
      } finally {
        setLoading(false);
      }
    };

    loadInventoryItem();
  }, [id, navigate, user]);

  const needsExpiry = (cat) => !!cat && !noExpiry.has(cat);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm(prev => ({...prev, image: files[0] || prev.image}));
      return;
    }
    setForm(prev => ({...prev, [name]: value}));
  };

  const fileToDataUrl = (file) => new Promise((res, rej) => {
    if (!file || typeof file === 'string') return res(file || null);
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return alert('Name required');
    if (!form.category) return alert('Category required');
    if (!form.price) return alert('Price required');
    if (!form.quantity) return alert('Quantity required');
    if (needsExpiry(form.category) && !form.expiryDate) return alert('Expiry required for this category');
    if (form.minStockLevel === "" || isNaN(Number(form.minStockLevel)) || Number(form.minStockLevel) < 0) {
      return alert('Enter valid Low Stock (minimum) value');
    }

    let imageData = form.image;
    if (form.image && typeof form.image !== 'string') {
      try { imageData = await fileToDataUrl(form.image); } catch(e){ imageData = null; }
    }

    const list = JSON.parse(localStorage.getItem('inventoryItems') || '[]');
    const updated = list.map(it => {
      if ((it.inventoryId || it.id) === id) {
        return {
          ...it,
          inventoryId: form.inventoryId,
          name: form.name,
          category: form.category,
          price: Number(form.price),
          quantity: Number(form.quantity),
          minStockLevel: Number(form.minStockLevel), // NEW saved field
          expiryDate: needsExpiry(form.category) ? form.expiryDate : null,
          description: form.description,
          image: imageData,
          supplier: form.supplier?.trim() || "" // NEW saved supplier
        };
      }
      return it;
    });
    localStorage.setItem('inventoryItems', JSON.stringify(updated));
    alert('Updated');
    navigate(`/inventory/${form.inventoryId}/details`);
  };

  if (loading) {
    return (
      <div className="update-loading">
        <div className="spinner"></div>
        <p>Loading inventory item...</p>
      </div>
    );
  }

  if (!form) {
    return null; // form failed to load (already navigated away), keep minimal render
  }

  return (
    <div className="update-inventory-wrap">
      <div className="update-inventory-container">
        <div className="update-header">
          <h2>✏️ Update Inventory Item</h2>
          <p>Edit the details of inventory item: <strong>{form.inventoryId}</strong></p>
        </div>
        
        <form className="update-inventory-form" onSubmit={handleSubmit}>
          {/* Inventory ID - Read Only */}
          <div className="form-group">
            <label>Inventory ID</label>
            <input
              type="text"
              value={displayId(form.inventoryId)}
              readOnly
              className="readonly-field"
            />
          </div>

          {/* Item Name */}
          <div className="form-group">
            <label>Item Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter item name"
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Price and Quantity Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Price ($) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Low Stock (Min quantity)</label>
              <input
                type="number"
                name="minStockLevel"
                value={form.minStockLevel ?? ''}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          {/* Expiry Date and Description Row */}
          <div className="form-row">
            {needsExpiry(form.category) && (
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate || ''}
                  onChange={handleChange}
                />
              </div>
            )}
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter item description (optional)"
                rows="3"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label>Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
          </div>

          {/* Supplier - NEW FIELD */}
          <div className="form-group">
            <label>Supplier</label>
            <input
              type="text"
              name="supplier"
              value={form.supplier || ''}
              onChange={handleChange}
              placeholder="Supplier name (optional)"
            />
          </div>

          {/* Form Buttons */}
          <div className="form-buttons">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => navigate('/inventory')}
            >
              ❌ Cancel
            </button>
            <button
              type="submit"
              className="btn btn-update"
            >
              ✅ Update Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateInventory;