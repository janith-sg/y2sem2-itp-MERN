// src/components/Checkout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Checkout.css";

export default function Checkout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [items, setItems] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(null); // NEW: holds order record for confirmation

  // NEW: shipping & payment form state
  const [shipping, setShipping] = useState({
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: ""
  });
  const [payment, setPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  // toggle to show/hide card number
  const [showCardNumber, setShowCardNumber] = useState(false);
  const toggleShowCard = () => setShowCardNumber(prev => !prev);
  
  // Normalize items from navigation state OR localStorage cart
  useEffect(() => {
    const stateItems = (location.state && location.state.items) || null;
    if (stateItems && Array.isArray(stateItems) && stateItems.length > 0) {
      // state may contain purchasedItems (purchasedQty) or checkout items (cartQuantity)
      const normalized = stateItems.map(it => ({
        inventoryId: it.inventoryId || it.id || it.inventory_id || "",
        id: it.id || it.inventoryId || "",
        name: it.name || it.itemName || "",
        unitPrice: Number(it.unitPrice ?? it.price ?? 0),
        qty: Number(it.purchasedQty ?? it.cartQuantity ?? 1),
        supplier: it.supplier || "",
        image: it.image || null
      }));
      setItems(normalized);
      return;
    }

    // fallback to cart in localStorage
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const normalized = cart.map(it => ({
        inventoryId: it.inventoryId || it.id || "",
        id: it.id || it.inventoryId || "",
        name: it.name || it.itemName || "",
        unitPrice: Number(it.unitPrice ?? it.price ?? 0),
        qty: Number(it.cartQuantity || 1),
        supplier: it.supplier || "",
        image: it.image || null
      }));
      setItems(normalized);
    } catch (err) {
      setItems([]);
    }
  }, [location.state]);

  const subtotal = useMemo(() => items.reduce((s, it) => s + (it.unitPrice * it.qty), 0), [items]);

  const formatCurrency = (amount) => {
    const n = Number(amount || 0);
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // NEW: simple validation for shipping & payment
  const validateForm = () => {
    if (!shipping.fullName.trim() || !shipping.address1.trim() || !shipping.city.trim() || !shipping.zip.trim() || !shipping.country.trim()) {
      alert("Please fill required shipping fields (Full name, Address, City, ZIP, Country).");
      return false;
    }
    // simple card validation: digits length checks
    const cn = payment.cardNumber.replace(/\s+/g, "");
    if (!/^\d{13,19}$/.test(cn)) { alert("Enter a valid card number (13-19 digits)."); return false; }
    if (!/^\d{3,4}$/.test(payment.cvv)) { alert("Enter a valid CVV (3-4 digits)."); return false; }
    // expiry MM/YY or MM/YYYY basic
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2}|[0-9]{4})$/.test(payment.expiry)) { alert("Enter expiry as MM/YY or MM/YYYY"); return false; }
    return true;
  };

  const maskCard = (num) => {
    const s = (num || "").replace(/\s+/g, "");
    if (s.length <= 4) return s;
    return "**** **** **** " + s.slice(-4);
  };

  const generateOrderId = () => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const max = orders.reduce((m, o) => {
      const id = (o.orderId || "").toString();
      if (id.startsWith("ORD-")) {
        const num = parseInt(id.split("-")[1], 10);
        return isNaN(num) ? m : Math.max(m, num);
      }
      return m;
    }, 0);
    return `ORD-${String(max + 1).padStart(4, "0")}`;
  };

  // placeOrder updated to use shipping & payment, update sold/revenue on inventory
  const placeOrder = async () => {
    if (items.length === 0) {
      alert("No items to place an order.");
      return;
    }
    if (!validateForm()) return;

    if (!window.confirm("Place order for the items shown?")) return;
    setProcessing(true);

    try {
      // Load inventory and cart
      const inventory = JSON.parse(localStorage.getItem("inventoryItems") || "[]");
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      const updatedInventory = [...inventory];
      const updatedCart = [...cart];
      const purchased = [];

      // Process each item, deduct stock
      for (const it of items) {
        const invIdx = updatedInventory.findIndex(inv =>
          (inv.inventoryId && inv.inventoryId === it.inventoryId) ||
          (inv.id && inv.id === it.id)
        );
        const available = invIdx !== -1 ? Number(updatedInventory[invIdx].quantity ?? updatedInventory[invIdx].stockQuantity ?? 0) : 0;
        const want = Number(it.qty || 0);
        if (available <= 0) continue;
        const purchaseQty = Math.min(want, available);
        const unitPrice = Number(updatedInventory[invIdx]?.price ?? it.unitPrice ?? 0);

        // deduct stock and persist both quantity names
        if (invIdx !== -1) {
          const remaining = available - purchaseQty;
          updatedInventory[invIdx] = {
            ...updatedInventory[invIdx],
            // write canonical fields used across the app/backend
            quantity: remaining,
            stockQuantity: remaining,
            // keep min stock consistent
            minStockLevel: Number(updatedInventory[invIdx].minStockLevel ?? updatedInventory[invIdx].minStock ?? 0),
            minStock: Number(updatedInventory[invIdx].minStockLevel ?? updatedInventory[invIdx].minStock ?? 0),
            // increment soldQuantity and revenue
            soldQuantity: (Number(updatedInventory[invIdx].soldQuantity || 0) + purchaseQty),
            totalRevenue: (Number(updatedInventory[invIdx].totalRevenue || 0) + (purchaseQty * unitPrice))
          };
        }

        // update cart entries
        const cartIdx = updatedCart.findIndex(c => (c.inventoryId && c.inventoryId === it.inventoryId) || (c.id && c.id === it.id));
        if (cartIdx !== -1) {
          const remain = (updatedCart[cartIdx].cartQuantity || 0) - purchaseQty;
          if (remain > 0) {
            updatedCart[cartIdx].cartQuantity = remain;
          } else {
            updatedCart.splice(cartIdx, 1);
          }
        }

        if (purchaseQty > 0) {
          purchased.push({ ...it, purchasedQty: purchaseQty, unitPrice });
        }
      }

      // Save updated inventory: now includes quantity and stockQuantity fields
      localStorage.setItem("inventoryItems", JSON.stringify(updatedInventory));
      window.dispatchEvent(new Event("inventoryUpdated"));

      // Save updated cart (may be empty)
      if (updatedCart.length > 0) localStorage.setItem("cart", JSON.stringify(updatedCart));
      else localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));

      // create order record with shipping & masked payment
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      const orderId = `ORD-${String((orders.length ? orders.length : 0) + 1).padStart(5, "0")}`;
      const orderTotal = purchased.reduce((s, p) => s + (p.unitPrice * p.purchasedQty), 0);
      const orderRecord = {
        orderId,
        items: purchased,
        total: orderTotal,
        createdAt: new Date().toISOString(),
        userEmail: user ? user.email : "guest",
        status: "Completed",
        shipping: { ...shipping },
        paymentMask: maskCard(payment.cardNumber)
      };
      orders.unshift(orderRecord);
      localStorage.setItem("orders", JSON.stringify(orders));

      // show in-page confirmation
      setOrderPlaced(orderRecord);
      // clear current items (checkout items were consumed)
      setItems([]);
      // keep cart updated already saved above
    } catch (err) {
      console.error("Place order failed:", err);
      alert("Failed to place order. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <h2>Checkout</h2>
        {/* If orderPlaced exists, show confirmation UI */}
        {orderPlaced ? (
          <div style={{ padding: 18, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
            <h3>Order placed successfully!</h3>
            <p style={{ color: '#6b7280' }}>Order ID: <strong>{orderPlaced.orderId}</strong></p>
            <p style={{ color: '#334155' }}>Total: <strong>{formatCurrency(orderPlaced.total)}</strong></p>
            <div style={{ marginTop: 12, textAlign: 'left' }}>
              <h4 style={{ marginBottom: 8 }}>Items</h4>
              <ul style={{ paddingLeft: 18, color: '#475569' }}>
                {orderPlaced.items.map((it, idx) => (
                  <li key={idx}>{it.name} × {it.purchasedQty} — {formatCurrency(it.unitPrice * it.purchasedQty)}</li>
                ))}
              </ul>
            </div>
            <div style={{ marginTop: 16, display:'flex', justifyContent:'center', gap:12 }}>
              <Link to="/orders" className="btn btn-primary">View Orders</Link>
              <Link to="/inventory" className="btn btn-secondary">Continue Shopping</Link>
            </div>
          </div>
        ) : (
          <>
            {items.length === 0 ? (
              <div className="empty">No items to checkout. <Link to="/inventory">Browse inventory</Link></div>
            ) : (
              <>
                <div className="checkout-items">
                  {items.map((it, idx) => (
                    <div key={idx} className="checkout-item">
                      <div className="left">
                        <div className="name">{it.name}</div>
                        <div className="meta">Supplier: {it.supplier || "—"}</div>
                      </div>
                      <div className="qty-price">
                        <div>{it.qty} × {formatCurrency(it.unitPrice)}</div>
                        <div className="line-total">{formatCurrency(it.unitPrice * it.qty)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="checkout-summary">
                  <div className="row"><span>Items:</span><span>{items.reduce((s, i) => s + i.qty, 0)}</span></div>
                  <div className="row total"><span>Total:</span><span>{formatCurrency(subtotal)}</span></div>

                  {/* Shipping form */}
                  <div style={{ marginTop: 16 }}>
                    <h3>Shipping Details</h3>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <input placeholder="Full name" value={shipping.fullName} onChange={e => setShipping({...shipping, fullName: e.target.value})} />
                      <input placeholder="Address line 1" value={shipping.address1} onChange={e => setShipping({...shipping, address1: e.target.value})} />
                      <input placeholder="Address line 2" value={shipping.address2} onChange={e => setShipping({...shipping, address2: e.target.value})} />
                      <input placeholder="City" value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} />
                      <input placeholder="State" value={shipping.state} onChange={e => setShipping({...shipping, state: e.target.value})} />
                      <input placeholder="ZIP" value={shipping.zip} onChange={e => setShipping({...shipping, zip: e.target.value})} />
                      <input placeholder="Country" value={shipping.country} onChange={e => setShipping({...shipping, country: e.target.value})} />
                    </div>
                  </div>

                  {/* Payment form */}
                  <div style={{ marginTop: 16 }}>
                    <h3>Payment Details</h3>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <input placeholder="Name on card" value={payment.cardName} onChange={e => setPayment({...payment, cardName: e.target.value})} />
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          placeholder="Card number"
                          value={payment.cardNumber}
                          onChange={e => setPayment({...payment, cardNumber: e.target.value})}
                          type={showCardNumber ? "text" : "password"}
                          inputMode="numeric"
                          autoComplete="cc-number"
                          style={{ width: '100%', paddingRight: 90 }}
                        />
                        <button
                          type="button"
                          onClick={toggleShowCard}
                          aria-pressed={showCardNumber}
                          style={{
                            position: 'absolute',
                            right: 6,
                            padding: '8px 10px',
                            borderRadius: 6,
                            border: '1px solid rgba(0,0,0,0.08)',
                            background: showCardNumber ? '#e0a800' : '#f1f1f1',
                            cursor: 'pointer'
                          }}
                        >
                          {showCardNumber ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input placeholder="Expiry MM/YY" value={payment.expiry} onChange={e => setPayment({...payment, expiry: e.target.value})} />
                      <input placeholder="CVV" value={payment.cvv} onChange={e => setPayment({...payment, cvv: e.target.value})} />
                    </div>
                  </div>

                  <div className="actions" style={{ marginTop: 18 }}>
                    <button className="btn btn-secondary" onClick={() => navigate('/inventory')}>Continue Shopping</button>
                    <button className="btn btn-primary" onClick={placeOrder} disabled={processing}>
                      {processing ? "Processing..." : "Place Order"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}