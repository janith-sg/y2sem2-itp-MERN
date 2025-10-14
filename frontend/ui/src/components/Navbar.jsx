// Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Navbar.css";

export default function Navbar() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [cartCount, setCartCount] = useState(0);

	// compute cart count from localStorage
	const computeCartCount = () => {
		try {
			const cart = JSON.parse(localStorage.getItem("cart") || "[]");
			const total = cart.reduce((s, it) => s + (it.cartQuantity || 0), 0);
			setCartCount(total);
		} catch (err) {
			setCartCount(0);
		}
	};

	useEffect(() => {
		computeCartCount();
		const onCartUpdated = () => computeCartCount();
		const onStorage = (e) => {
			if (e.key === "cart" || e.key === "inventoryItems") computeCartCount();
		};
		window.addEventListener("cartUpdated", onCartUpdated);
		window.addEventListener("storage", onStorage);
		return () => {
			window.removeEventListener("cartUpdated", onCartUpdated);
			window.removeEventListener("storage", onStorage);
		};
	}, []);

	const handleLogout = async () => {
		try {
			if (typeof logout === "function") {
				await logout();
			} else {
				// fallback: clear auth-like keys
				localStorage.removeItem("user");
				localStorage.removeItem("token");
			}
		} catch (err) {
			console.warn("Logout error:", err);
		} finally {
			navigate("/login");
		}
	};

	return (
		<nav className="app-navbar">
			<div className="nav-left">
				<Link to="/" className="brand">
					<span className="brand-icon">🐾</span>
					<span className="brand-text">PetCare+</span>
				</Link>
			</div>

			<div className="nav-center">
				{user?.role === 'admin' ? (
					<>
						<Link to="/" className="nav-link">Home</Link>
						<Link to="/add-inventory" className="nav-link">Add Inventory</Link>
						<Link to="/appointments" className="nav-link">View Appointments</Link>
						<Link to="/contact" className="nav-link">Contact Us</Link>
						<Link to="/about" className="nav-link">About Us</Link>
						<Link to="/feedback" className="nav-link">Feedback</Link>
					</>
				) : (
					<>
						<Link to="/" className="nav-link">Home</Link>
						<Link to="/inventory" className="nav-link">Buy Inventory</Link>
						<Link to="/add-appointment" className="nav-link">Add Appointment</Link>
						<Link to="/about" className="nav-link">About Us</Link>
						<Link to="/contact" className="nav-link">Contact Us</Link>
						<Link to="/feedback" className="nav-link">Feedbacks</Link>
					</>
				)}
			</div>

			<div className="nav-right">
				{/* Cart badge */}
				<Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
					<span className="icon">🛒</span>
					{cartCount > 0 && <span className="badge">{cartCount}</span>}
				</Link>

				{/* Greeting */}
				{user ? (
					<>
						<span className="greeting">Hi, <strong>{user.email}</strong></span>
						<button className="btn btn-logout" onClick={handleLogout}>Logout</button>
					</>
				) : (
					<>
						<Link to="/login" className="btn btn-login">Login</Link>
						<Link to="/register" className="btn btn-signup">Sign up</Link>
					</>
				)}
			</div>
		</nav>
	);
}
