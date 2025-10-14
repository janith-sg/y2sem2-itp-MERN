// src/components/Cart.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Cart.css";

const Cart = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [cartItems, setCartItems] = useState([]);
	const [loading, setLoading] = useState(true);

	const formatCurrency = (amount) => {
		const n = Number(amount || 0);
		return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	};

	// Load cart items and enrich from latest inventory (quantityAvailable, minStockLevel, unitPrice, name)
	const loadCartItems = () => {
		try {
			const rawCart = JSON.parse(localStorage.getItem('cart') || '[]');
			const inventory = JSON.parse(localStorage.getItem('inventoryItems') || '[]');

			// build lookup by inventoryId or id
			const invMap = {};
			inventory.forEach(inv => {
				const key = inv.inventoryId || inv.id;
				if (key) invMap[key] = inv;
			});

			let changed = false;
			const enriched = rawCart.map(ci => {
				const key = ci.inventoryId || ci.id;
				const inv = invMap[key];
				const quantityAvailable = Number(inv?.quantity ?? inv?.stockQuantity ?? ci.quantityAvailable ?? 0);
				const minStockLevel = Number(inv?.minStockLevel ?? inv?.minStock ?? ci.minStockLevel ?? 0);
				const unitPrice = Number(ci.unitPrice ?? ci.price ?? inv?.price ?? 0);
				const name = ci.name || ci.itemName || inv?.name || inv?.itemName || '';

				// Cap existing cart quantity to available
				const desired = Number(ci.cartQuantity ?? ci.quantity ?? 1);
				const capped = Math.min(desired, Math.max(0, quantityAvailable));
				if (capped !== desired) changed = true;

				return {
					...ci,
					id: ci.id || key,
					inventoryId: key,
					name,
					itemName: name,
					unitPrice,
					price: unitPrice,
					quantityAvailable,
					minStockLevel,
					cartQuantity: capped
				};
			});

			// if we capped any quantities, persist corrected cart
			if (changed) {
				localStorage.setItem('cart', JSON.stringify(enriched));
				window.dispatchEvent(new Event('cartUpdated'));
			}

			setCartItems(enriched);
			setLoading(false);
		} catch (error) {
			console.error('Error loading cart:', error);
			setCartItems([]);
			setLoading(false);
		}
	};

	// ensure cart reloads on mount and when inventory changes in other parts of app (and storage event)
	useEffect(() => {
		if (!user) {
			navigate('/login');
			return;
		}

		loadCartItems();

		const onInventoryUpdated = () => {
			loadCartItems();
		};
		const onStorage = (e) => {
			if (e.key === 'cart' || e.key === 'inventoryItems' || e.key === 'lastInventoryAdded') {
				loadCartItems();
			}
		};

		window.addEventListener('inventoryUpdated', onInventoryUpdated);
		window.addEventListener('storage', onStorage);

		return () => {
			window.removeEventListener('inventoryUpdated', onInventoryUpdated);
			window.removeEventListener('storage', onStorage);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, navigate]);

	const updateQuantity = (itemId, newQuantity) => {
		if (newQuantity <= 0) {
			removeFromCart(itemId);
			return;
		}

		const updatedCart = cartItems.map(item => {
			if (item.id === itemId) {
				const available = Number(item.quantityAvailable ?? 0);
				if (newQuantity > available) {
					alert(`Only ${available} items available in stock`);
					return { ...item, cartQuantity: available, quantityAvailable: available };
				}
				return { ...item, cartQuantity: newQuantity, quantityAvailable: available };
			}
			return item;
		});

		setCartItems(updatedCart);
		localStorage.setItem('cart', JSON.stringify(updatedCart));
		window.dispatchEvent(new Event('cartUpdated'));
	};

	const removeFromCart = (itemId) => {
		const updatedCart = cartItems.filter(item => item.id !== itemId);
		setCartItems(updatedCart);
		localStorage.setItem('cart', JSON.stringify(updatedCart));
		// Dispatch custom event to update cart count in navbar
		window.dispatchEvent(new Event('cartUpdated'));
	};

	const clearCart = () => {
		if (window.confirm('Are you sure you want to clear your cart?')) {
			setCartItems([]);
			localStorage.removeItem('cart');
			// Dispatch custom event to update cart count in navbar
			window.dispatchEvent(new Event('cartUpdated'));
		}
	};

	const getTotalAmount = () => {
		return cartItems.reduce((total, item) => total + (item.unitPrice * item.cartQuantity), 0);
	};

	const getTotalItems = () => {
		return cartItems.reduce((total, item) => total + item.cartQuantity, 0);
	};

	const proceedToCheckout = () => {
		if (cartItems.length === 0) {
			alert('Your cart is empty');
			return;
		}

		// Load inventory from localStorage
		const inventory = JSON.parse(localStorage.getItem('inventoryItems') || '[]');

		const updatedInventory = [...inventory];
		const updatedCart = [];
		const purchasedItems = []; // items actually purchased (for confirmation)

		cartItems.forEach(cartItem => {
			const invIndex = updatedInventory.findIndex(inv =>
				(inv.inventoryId && inv.inventoryId === cartItem.inventoryId) ||
				(inv.id && inv.id === cartItem.id)
			);

			const available = invIndex !== -1 ? Number(updatedInventory[invIndex].quantity ?? 0) : 0;
			const want = Number(cartItem.cartQuantity || 0);

			if (available <= 0) {
				// nothing can be purchased for this item
				alert(`"${cartItem.itemName || cartItem.name}" is out of stock and was removed from your cart.`);
				// do not add to updatedCart or purchasedItems
				return;
			}

			const purchaseQty = Math.min(want, available);
			const remainingAfter = available - purchaseQty;

			// Update inventory if found
			if (invIndex !== -1) {
				updatedInventory[invIndex] = {
					...updatedInventory[invIndex],
					quantity: remainingAfter
				};
			}

			if (purchaseQty > 0) {
				purchasedItems.push({
					inventoryId: cartItem.inventoryId,
					id: cartItem.id,
					name: cartItem.itemName || cartItem.name,
					unitPrice: Number(cartItem.unitPrice || cartItem.price || 0),
					purchasedQty: purchaseQty,
					supplier: cartItem.supplier || ''
				});
			}

			// If customer wanted more than available, adjust cart to remaining unpurchased qty
			const unpurchased = want - purchaseQty;
			if (unpurchased > 0) {
				// keep remaining quantity in cart for user to review (or remove entirely if you prefer)
				updatedCart.push({
					...cartItem,
					cartQuantity: unpurchased,
					quantity: remainingAfter // update available display
				});
				alert(`Only ${purchaseQty} of "${cartItem.itemName || cartItem.name}" were available. ${unpurchased} left in cart requires restock.`);
			} else {
				// fully purchased -> do not re-add to cart
			}
		});

		// Save updated inventory back to localStorage
		try {
			localStorage.setItem('inventoryItems', JSON.stringify(updatedInventory));
			window.dispatchEvent(new Event('inventoryUpdated'));
		} catch (err) {
			console.error('Failed to save updated inventory after purchase:', err);
			alert('Purchase completed but failed to update inventory in local storage.');
		}

		// Save updated cart (remaining unpurchased items)
		try {
			if (updatedCart.length > 0) {
				localStorage.setItem('cart', JSON.stringify(updatedCart));
				setCartItems(updatedCart);
			} else {
				// Clear cart fully if nothing left
				localStorage.removeItem('cart');
				setCartItems([]);
			}
			window.dispatchEvent(new Event('cartUpdated'));
		} catch (err) {
			console.error('Failed to save updated cart:', err);
			alert('Purchase completed but failed to update cart in local storage.');
		}

		// Inform user of purchase summary
		if (purchasedItems.length > 0) {
			const summary = purchasedItems.map(pi => `${pi.name} x${pi.purchasedQty}`).join('\n');
			alert(`Purchase successful for:\n${summary}\n\nRemaining items (if any) left in your cart.`);
		} else {
			alert('No items were available to purchase.');
		}

		// Proceed to checkout page (keeps state for direct processing if needed)
		navigate('/checkout', { state: { items: purchasedItems, isDirectPurchase: false } });
	};

	if (loading) {
		return (
			<div className="cart-loading">
				<div className="spinner"></div>
				<p>Loading your cart...</p>
			</div>
		);
	}

	return (
		<div className="cart-container">
			<div className="cart-content">
				<div className="cart-header">
					<h1>🛒 Shopping Cart</h1>
					<div className="cart-stats">
						<span className="cart-count">{getTotalItems()} Items</span>
						<span className="cart-total">{formatCurrency(getTotalAmount())}</span>
					</div>
				</div>

				{cartItems.length === 0 ? (
					<div className="empty-cart">
						<div className="empty-cart-icon">🛒</div>
						<h2>Your cart is empty</h2>
						<p>Browse our inventory and add items to your cart</p>
						<Link to="/inventory" className="btn btn-primary">
							🏪 Browse Inventory
						</Link>
					</div>
				) : (
					<>
						<div className="cart-items">
							{cartItems.map((item) => (
								<div key={item.id} className="cart-item">
									<div className="cart-item-image">
										{(item.image || item.itemImage) ? (
											<img
												src={item.image || item.itemImage}
												alt={item.itemName || item.name}
												onLoad={() => console.log(`✅ Cart image loaded for: ${item.itemName || item.name}`)}
												onError={(e) => {
													console.error('❌ Cart image error for:', item.itemName || item.name);
													e.target.style.display = 'none';
													e.target.nextSibling.style.display = 'flex';
												}}
											/>
										) : null}
										<div className="no-image" style={{ display: (item.image || item.itemImage) ? 'none' : 'flex' }}>📦</div>
									</div>

									<div className="cart-item-details">
										<h3>{item.itemName || item.name}</h3>
										<p className="cart-item-category">{item.category || item.cat || '—'}</p>
										<p className="cart-item-price">{formatCurrency(item.unitPrice)} each</p>

										<p className="cart-item-stock">
											{(() => {
												const available = Number(item.quantityAvailable ?? 0);
												const min = Number(item.minStockLevel ?? 0);
												if (available <= 0) return <span style={{ color: '#6c757d' }}>Out of stock</span>;
												if (min && available <= min) return <span style={{ color: '#dc3545', fontWeight:700 }}>⚠️ Low stock — only {available} left</span>;
												return <span style={{ color: '#10b981', fontWeight:700 }}>In stock — {available} available</span>;
											})()}
										</p>
									</div>

									<div className="cart-item-quantity">
										<label>Quantity:</label>
										<div className="quantity-controls">
											<button className="qty-btn" onClick={() => updateQuantity(item.id, (item.cartQuantity || 0) - 1)}>−</button>
											<input
												type="number"
												value={item.cartQuantity || 0}
												onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
												min="1"
												max={item.quantityAvailable ?? 0}
											/>
											<button
												className="qty-btn"
												onClick={() => updateQuantity(item.id, (item.cartQuantity || 0) + 1)}
												disabled={(item.cartQuantity || 0) >= (item.quantityAvailable ?? 0)}
											>+</button>
										</div>
									</div>

									<div className="cart-item-total">
										<p className="item-total">{formatCurrency((item.unitPrice || 0) * (item.cartQuantity || 0))}</p>
										<button className="btn-remove" onClick={() => removeFromCart(item.id)}>🗑️ Remove</button>
									</div>
								</div>
							))}
						</div>

						<div className="cart-summary">
							<div className="cart-actions">
								<button className="btn btn-clear" onClick={clearCart}>🗑️ Clear Cart</button>
								<Link to="/inventory" className="btn btn-secondary">← Continue Shopping</Link>
							</div>

							<div className="cart-totals">
								<div className="total-row">
									<span>Total Items:</span>
									<span>{getTotalItems()}</span>
								</div>
								<div className="total-row final-total">
									<span>Total Amount:</span>
									<span>{formatCurrency(getTotalAmount())}</span>
								</div>
								<button className="btn btn-checkout" onClick={proceedToCheckout}>💳 Proceed to Checkout</button>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default Cart;