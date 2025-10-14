// src/components/InventoryList.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import "./InventoryList.css";

const InventoryList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState([]); // original source
  const [visible, setVisible] = useState([]); // filtered/visible
  const [filterCategory, setFilterCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // categories
  const categories = [
    "Pet Food & Treats",
    "Health & Wellness",
    "Toys & Entertainment",
    "Grooming & Hygiene",
    "Accessories",
    "Habitat & Comfort",
    "Training Essentials"
  ];

  // Load inventory data (normalize fields)
  const loadInventory = useCallback(() => {
    try {
      setLoading(true);
      const raw = JSON.parse(localStorage.getItem('inventoryItems') || '[]');

      // Normalize to consistent property names: inventoryId, name, price, quantity, expiryDate, description, image, category
      const normalized = raw.map(item => {
        // Prefer canonical quantity fields: quantity, stockQuantity, qty
        const qty = Number(item.quantity ?? item.stockQuantity ?? item.qty ?? 0);
        const min = Number(item.minStockLevel ?? item.minStock ?? 0);
        // determine status using minStockLevel
        let computedStatus = (item.status || "").toString();
        if (!computedStatus) {
          if (qty <= 0) computedStatus = 'Out of Stock';
          else if (min && qty <= min) computedStatus = 'Low Stock';
          else computedStatus = 'In Stock';
        }

        return {
          inventoryId: item.inventoryId || item.id || item.inventory_id || '',
          name: item.name || item.itemName || item.productName || '',
          category: item.category || item.cat || 'Uncategorized',
          price: Number(item.price ?? item.unitPrice ?? 0),
          quantity: qty, // normalized canonical quantity
          expiryDate: item.expiryDate || item.expiry || null,
          description: item.description || item.desc || '',
          image: item.image || item.imageBase64 || null,
          supplier: item.supplier || item.vendor || '',
          minStockLevel: min, // expose threshold
          status: computedStatus,
          createdAt: item.createdAt || new Date().toISOString(),
          // NEW: read sold / revenue if present (keeps persisted values)
          soldQuantity: Number(item.soldQuantity ?? 0),
          totalRevenue: Number(item.totalRevenue ?? 0)
        };
      });

      setAllItems(normalized);
      // do not overwrite visible filtering here; let effect handle visible when allItems changes
      setVisible(prev => {
        // if user currently filtering, preserve filter; otherwise show all
        return normalized;
      });
    } catch (error) {
      console.error("Error loading inventory:", error);
      setAllItems([]);
      setVisible([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial load
    loadInventory();

    // refresh when another tab updates localStorage
    const onStorage = (e) => {
      if (e.key === 'inventoryItems') loadInventory();
    };
    // refresh when AddInventory dispatches custom event
    window.addEventListener('inventoryUpdated', loadInventory);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('inventoryUpdated', loadInventory);
      window.removeEventListener('storage', onStorage);
    };
  }, [loadInventory]);

  // Filter visible list when searchTerm or category or allItems change
  useEffect(() => {
    const term = (searchTerm || "").toLowerCase().trim();
    let filtered = allItems;

    if (filterCategory) {
      filtered = filtered.filter(i => i.category === filterCategory);
    }

    if (term) {
      filtered = filtered.filter(i =>
        (i.name || "").toLowerCase().includes(term) ||
        (i.inventoryId || "").toLowerCase().includes(term) ||
        (i.category || "").toLowerCase().includes(term) ||
        (i.supplier || "").toLowerCase().includes(term) ||
        (i.status || "").toLowerCase().includes(term)
      );
    }

    setVisible(filtered);
  }, [searchTerm, filterCategory, allItems]);

  // add to cart (localStorage 'cart') — normalized cart item shape
  const addToCart = (item, qty = 1) => {
    try {
      if (!item || !item.inventoryId) {
        console.warn('addToCart: invalid item', item);
        alert('Cannot add this item to cart.');
        return;
      }

      const cart = JSON.parse(localStorage.getItem('cart') || '[]');

      // Build normalized cart item (include minStockLevel)
      const newCartItem = {
        id: item.inventoryId,               // legacy consumers may use id
        inventoryId: item.inventoryId,      // canonical id
        name: item.name || item.itemName || '',
        itemName: item.name || item.itemName || '',
        unitPrice: Number(item.price ?? item.unitPrice ?? 0),
        price: Number(item.price ?? item.unitPrice ?? 0),
        quantityAvailable: Number(item.quantity ?? 0),
        minStockLevel: Number(item.minStockLevel ?? 0), // NEW
        cartQuantity: Math.max(1, parseInt(qty, 10)),
        image: item.image || null,
        supplier: item.supplier || '',
        createdAt: item.createdAt || ''
      };

      // Cap requested quantity to available stock
      if (newCartItem.cartQuantity > newCartItem.quantityAvailable) {
        newCartItem.cartQuantity = newCartItem.quantityAvailable;
        alert(`Only ${newCartItem.quantityAvailable} items available. Added maximum available to cart.`);
      }

      // Try to find existing by inventoryId or id
      const idx = cart.findIndex(c => (c.inventoryId && c.inventoryId === newCartItem.inventoryId) || (c.id && c.id === newCartItem.id));
      if (idx !== -1) {
        // Merge quantities, cap at available
        const existing = cart[idx];
        const updatedQty = Math.min(existing.quantityAvailable, (existing.cartQuantity || 0) + newCartItem.cartQuantity);
        cart[idx] = {
          ...existing,
          cartQuantity: updatedQty,
          // keep other fields up-to-date
          unitPrice: newCartItem.unitPrice,
          price: newCartItem.price,
          name: newCartItem.name,
          supplier: newCartItem.supplier,
          image: newCartItem.image,
          minStockLevel: newCartItem.minStockLevel
        };
      } else {
        cart.push(newCartItem);
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      alert('Added to cart');
    } catch (err) {
      console.error('Error adding to cart', err);
      alert('Failed to add to cart');
    }
  };

  // buyNow adds the item to cart and navigates to checkout (passes state for direct purchase)
  const buyNow = (item) => {
    if (!item || !item.inventoryId) {
      alert('Cannot purchase this item.');
      return;
    }

    // Add single qty to cart (will merge if exists)
    addToCart(item, 1);

    // Build quick checkout item to pass via navigation state (some checkout pages use this)
    const checkoutItem = {
      id: item.inventoryId,
      inventoryId: item.inventoryId,
      name: item.name || item.itemName || '',
      unitPrice: Number(item.price ?? item.unitPrice ?? 0),
      cartQuantity: 1,
      quantityAvailable: Number(item.quantity ?? 0),
      supplier: item.supplier || '',
      image: item.image || null
    };

    // Navigate to checkout; pass cart item in state for direct purchase flows
    try {
      navigate('/checkout', { state: { items: [checkoutItem], isDirectPurchase: true } });
    } catch (err) {
      // If navigation with state is not handled by checkout, user will still find the item in localStorage 'cart'
      console.warn('Navigation with state failed, fallback to cart-based checkout', err);
      navigate('/checkout');
    }
  };

  // delete item (admin)
  const deleteItem = (inventoryId) => {
    if (!window.confirm('Delete this item permanently?')) return;
    const remaining = allItems.filter(i => i.inventoryId !== inventoryId);
    setAllItems(remaining);
    localStorage.setItem('inventoryItems', JSON.stringify(remaining));
    alert('Item deleted');
  };

  // Download PDF (uses latest inventory data, no images, includes more columns)
  const downloadInventoryPDF = () => {
    try {
      const raw = JSON.parse(localStorage.getItem('inventoryItems') || '[]');

      // Normalize and compute totals/status
      const normalized = raw.map(item => {
        const qty = Number(item.quantity ?? item.qty ?? 0);
        const min = Number(item.minStockLevel ?? item.minStock ?? 0);
        let computedStatus = (item.status || "").toString();
        if (!computedStatus) {
          if (qty <= 0) computedStatus = 'Out of Stock';
          else if (min && qty <= min) computedStatus = 'Low Stock';
          else computedStatus = 'In Stock';
        }
        const price = Number(item.price ?? item.unitPrice ?? 0);
        const totalValue = price * qty;
        return {
          inventoryId: item.inventoryId || item.id || item.inventory_id || '',
          name: item.name || item.itemName || item.productName || '',
          category: item.category || item.cat || 'Uncategorized',
          price,
          quantity: qty,
          expiryDate: item.expiryDate || item.expiry || null,
          minStockLevel: min,
          status: computedStatus,
          supplier: item.supplier || item.vendor || '',
          description: (item.description || item.desc || '').toString(),
          createdAt: item.createdAt || ''
        , totalValue};
      });

      if (!normalized.length) {
        alert('No inventory items to include in PDF.');
        return;
      }

      const doc = new jsPDF('landscape', 'pt', 'a4');
      const marginLeft = 40;
      const startY = 70;

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Inventory Report', marginLeft, 40);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, 56);

      // Prepare table rows (array-of-arrays) and column headers
      const head = [['ID','Name','Category','Min Stock','Qty','Status','Unit Price','Total Value','Supplier','Expiry','Created','Description']];
      const body = normalized.map(it => {
        // truncate long description to keep table readable
        const desc = it.description.length > 120 ? it.description.slice(0, 117) + '...' : it.description;
        const expiry = it.expiryDate ? new Date(it.expiryDate).toLocaleDateString() : '—';
        const created = it.createdAt ? new Date(it.createdAt).toLocaleString() : '—';
        return [
          it.inventoryId,
          it.name,
          it.category,
          it.minStockLevel != null ? String(it.minStockLevel) : '—',
          String(it.quantity),
          it.status,
          it.price != null ? `$${it.price.toFixed(2)}` : '—',
          `$${(it.totalValue ?? 0).toFixed(2)}`,
          it.supplier || '—',
          expiry,
          created,
          desc
        ];
      });

      autoTable(doc, {
        startY,
        head,
        body,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [102,126,234], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 60 },   // ID
          1: { cellWidth: 200 },  // Name
          2: { cellWidth: 120 },  // Category
          3: { cellWidth: 60 },   // Min Stock
          4: { cellWidth: 50 },   // Qty
          5: { cellWidth: 80 },   // Status
          6: { cellWidth: 70 },   // Unit Price
          7: { cellWidth: 70 },   // Total Value
          8: { cellWidth: 110 },  // Supplier
          9: { cellWidth: 70 },   // Expiry
          10: { cellWidth: 110 }, // Created
          11: { cellWidth: 250 }  // Description
        },
        styles: { overflow: 'linebreak' },
        didDrawPage: function (data) {
          // Add page footer (page number)
          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
          }
        }
      });

      const filename = `Inventory_Report_${new Date().toISOString().slice(0,10)}.pdf`;
      doc.save(filename);
      alert(`PDF downloaded: ${filename}`);
    } catch (err) {
      console.error('Error generating inventory PDF:', err);
      alert('Error generating PDF. Please try again.');
    }
  };

  // helper: map status -> color
  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case 'low stock': return '#dc3545';
      case 'out of stock': return '#6c757d';
      case 'in stock': return '#10b981';
      default: return '#3b82f6';
    }
  };

  // Helper: read the latest available quantity from localStorage for a given inventoryId
  const getAvailableFromStore = (inventoryId) => {
    try {
      const raw = JSON.parse(localStorage.getItem('inventoryItems') || '[]');
      const found = raw.find(it => (it.inventoryId && String(it.inventoryId) === String(inventoryId)) || (it.id && String(it.id) === String(inventoryId)));
      if (!found) return 0;
      // prefer canonical quantity fields
      return Number(found.quantity ?? found.stockQuantity ?? found.qty ?? 0);
    } catch (err) {
      console.warn('getAvailableFromStore error', err);
      return 0;
    }
  };

  if (loading) {
    return <div className="inventory-loading"><div className="spinner" /> Loading inventory...</div>;
  }

  return (
    <div className="inventory-list-container">
      <div className="inventory-content-wrapper">
        {/* Header */}
        <div className="inventory-header">
          <h2 className="inventory-title">📦 Inventory Management</h2>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-bar">
            <input
              className="search-input"
              type="text"
              placeholder="🔍 Search by name, ID, category, supplier, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search"
                title="Clear search"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {user && user.role === 'admin' && (
            <>
              <button className="btn btn-add" onClick={() => navigate('/add-inventory')}>➕ Add New Item</button>
              <button className="btn btn-download" onClick={downloadInventoryPDF}>📄 Download PDF</button>
            </>
          )}
          {searchTerm && <button className="btn btn-clear" onClick={() => setSearchTerm("")}>Clear Search</button>}
        </div>

        {/* Total / info */}
        <div className="search-results-info" style={{ marginTop: 8 }}>
          <span className="results-count">Showing {visible.length} item(s){filterCategory ? ` in "${filterCategory}"` : ''}{searchTerm ? ` — matching "${searchTerm}"` : ''}</span>
        </div>

        {/* Inventory Grid */}
        <div className="inventory-grid">
          {visible.length === 0 ? (
            <div className="no-items">
              <div className="no-items-icon">📦</div>
              <h3>{searchTerm ? '🔍 No Search Results' : '📭 No Inventory Items'}</h3>
              <p>
                {searchTerm
                  ? `No items found matching "${searchTerm}". Try a different search term.`
                  : 'No inventory items available. Add your first inventory item to get started!'
                }
              </p>
              {!searchTerm && user && user.role === 'admin' && (
                <button className="btn btn-add" onClick={() => navigate('/add-inventory')}>➕ Add First Item</button>
              )}
            </div>
          ) : (
            visible.map(item => {
              // read authoritative available value from localStorage (fresh)
              const available = getAvailableFromStore(item.inventoryId);
              const min = Number(item.minStockLevel ?? item.minStock ?? 0);

              // compute status purely from available and min threshold
              let statusLabel = 'In Stock';
              if (available <= 0) statusLabel = 'Out of Stock';
              else if (min && available <= min) statusLabel = 'Low Stock';

               return (
                 <div className="inventory-card" key={item.inventoryId} role="article" aria-label={item.name}>
                   <div className="card-image" aria-hidden>
                     {item.image ? <img src={item.image} alt={item.name} /> : <div className="placeholder">No Image</div>}
                   </div>

                   <div className="card-body">
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <h4>{item.name}</h4>
                       <div className="stock-badge" style={{ backgroundColor: getStatusColor(statusLabel), color: '#fff', padding: '6px 10px', borderRadius: '999px', fontWeight: 700 }}>
                         {statusLabel}
                       </div>
                     </div>

                     <div className="meta">
                       <div className="id">{item.inventoryId}</div>
                       <div className="cat">{item.category}</div>
                       <div className="supplier" style={{ marginLeft: 8, color: '#475569', fontSize: 13 }}>
                         🏷️ {item.supplier || '—'}
                       </div>
                     </div>

                     {/* show authoritative available value */}
                     <div className="price">Price: ${Number(item.price).toFixed(2)}</div>
                     <div className="qty">Available: {available}</div>
                     <div className="expiry">Expiry: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "—"}</div>

                     <div className="actions">
                       {/* Details = yellow (shared shape) */}
                       <button className="btn btn-details" onClick={() => navigate(`/inventory/${item.inventoryId}/details`)}>👁️ Details</button>

                       {user?.role === 'admin' ? (
                         <>
                           <button className="btn-edit" onClick={() => navigate(`/inventory/${item.inventoryId}/edit`)}>✏️ Edit</button>
                           <button className="btn-delete" onClick={() => deleteItem(item.inventoryId)}>🗑️ Delete</button>
                         </>
                       ) : (
                         <>
                           {/* disable using authoritative available */}
                           <button className="btn btn-cart" onClick={() => addToCart(item)} disabled={available <= 0}>🛒 Add Cart</button>
                           <button className="btn btn-buy-now" onClick={() => buyNow(item)} disabled={available <= 0}>💳 Buy Now</button>
                         </>
                       )}
                     </div>
                   </div>
                 </div>
               );
             })
           )}
        </div>
      </div>
    </div>
  );
};

export default InventoryList;