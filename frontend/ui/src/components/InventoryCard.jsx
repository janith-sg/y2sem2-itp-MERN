// src/components/InventoryCard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./InventoryCard.css";

const InventoryCard = ({ item, onDelete, userRole, currentUser }) => {
  const navigate = useNavigate();
  const canEditDelete = userRole === "admin";

  // Debug: Log item data to check image
  React.useEffect(() => {
    if (item.itemImage) {
      const isValidBase64 = item.itemImage.startsWith('data:image/');
      console.log(`Item ${item.itemName} image info:`, {
        hasImage: !!item.itemImage,
        imageType: typeof item.itemImage,
        imageLength: item.itemImage?.length || 0,
        isValidBase64: isValidBase64,
        imagePreview: item.itemImage?.substring(0, 50) + '...'
      });
      
      if (!isValidBase64) {
        console.warn(`⚠️ Item ${item.itemName} has invalid image data format`);
      }
    } else {
      console.log(`Item ${item.itemName} has no image`);
    }
  }, [item]);

  // Helper function to display ID with spaces for UI
  const displayId = (id) => {
    return id.replace('I-', 'I - ');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Low Stock':
        return '#dc3545'; // Red
      case 'In Stock':
        return '#28a745'; // Green
      case 'Out of Stock':
        return '#6c757d'; // Gray
      default:
        return '#007bff'; // Blue
    }
  };

  const formatCurrency = (amount) => {
	// Use USD dollar format
	const n = Number(amount || 0);
	return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Add to Cart functionality
  const handleAddToCart = () => {
    if (!currentUser) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (item.quantity <= 0 || item.status === 'Out of Stock') {
      alert('This item is currently out of stock');
      return;
    }

    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item already exists in cart
    const existingItemIndex = existingCart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      existingCart[existingItemIndex].cartQuantity += 1;
      if (existingCart[existingItemIndex].cartQuantity > item.quantity) {
        alert(`Only ${item.quantity} items available in stock`);
        existingCart[existingItemIndex].cartQuantity = item.quantity;
      }
    } else {
      // Add new item to cart
      const cartItem = {
        ...item,
        cartQuantity: 1,
        addedAt: new Date().toISOString()
      };
      existingCart.push(cartItem);
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Dispatch custom event to update cart count in navbar
    window.dispatchEvent(new Event('cartUpdated'));
    
    alert(`${item.itemName} added to cart successfully!`);
  };

  // Buy Now functionality
  const handleBuyNow = () => {
    if (!currentUser) {
      alert('Please login to purchase items');
      navigate('/login');
      return;
    }

    if (item.quantity <= 0 || item.status === 'Out of Stock') {
      alert('This item is currently out of stock');
      return;
    }

    // Navigate to checkout page with this single item
    navigate('/checkout', { 
      state: { 
        items: [{ ...item, cartQuantity: 1 }], 
        isDirectPurchase: true 
      } 
    });
  };

  return (
    <div className="inventory-card">
      {/* Card Header */}
      <div className="inventory-card-header">
        <div className="inventory-id">
          <span className="id-label">ID:</span>
          <span className="id-value">{displayId(item.id)}</span>
        </div>
        <div 
          className="inventory-status"
          style={{ backgroundColor: getStatusColor(item.status) }}
        >
          {item.status}
        </div>
      </div>

      {/* Item Name */}
      <div className="inventory-item-name">
        <h3>{item.itemName}</h3>
        <span className="inventory-category">{item.category}</span>
      </div>

      {/* Item Image */}
      <div className="inventory-image-container">
        {item.itemImage ? (
          <img 
            src={item.itemImage} 
            alt={item.itemName}
            className="inventory-item-image"
            onLoad={() => {
              console.log(`✅ Image loaded successfully for: ${item.itemName}`);
            }}
            onError={(e) => {
              console.error('❌ Error loading image for item:', item.itemName);
              console.error('Image source:', item.itemImage?.substring(0, 100) + '...');
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="no-image-placeholder" 
          style={{ 
            display: item.itemImage ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '150px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: '8px',
            border: '2px dashed #dee2e6',
            color: '#6c757d',
            fontSize: '14px',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '24px' }}>📦</span>
          <span>No Image Available</span>
        </div>
      </div>

      {/* Item Details Grid - Only Mandatory Fields */}
      <div className="inventory-details">
        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">📦 Quantity:</span>
            <span className="detail-value">{item.quantity}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">💰 Unit Price:</span>
            <span className="detail-value">{formatCurrency(item.unitPrice)}</span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">💵 Total Value:</span>
            <span className="detail-value total-value">{formatCurrency(item.totalValue)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">🏪 Supplier:</span>
            <span className="detail-value">{item.supplier}</span>
          </div>
        </div>
      </div>

     

      {/* Action Buttons */}
      <div className="inventory-actions">
        <Link 
          to={`/inventory/${item.id}/details`} 
          className="btn btn-details"
        >
          👁️ Details
        </Link>
        
        {canEditDelete ? (
          // Admin buttons
          <>
            <Link 
              to={`/inventory/${item.id}/edit`} 
              className="btn btn-edit"
            >
              ✏️ Edit
            </Link>
            <button 
              className="btn btn-delete"
              onClick={() => onDelete(item.id, item.itemName)}
            >
              🗑️ Delete
            </button>
          </>
        ) : (
          // User buttons
          <>
            <button 
              className="btn btn-cart"
              onClick={handleAddToCart}
              disabled={item.quantity <= 0 || item.status === 'Out of Stock'}
            >
              🛒 Add to Cart
            </button>
            <button 
              className="btn btn-buy-now"
              onClick={handleBuyNow}
              disabled={item.quantity <= 0 || item.status === 'Out of Stock'}
            >
              💳 Buy Now
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryCard;