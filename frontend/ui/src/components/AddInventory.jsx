// src/components/AddInventory.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AddInventory.css";

// Simple Add Inventory page — saves to localStorage 'inventoryItems'
export default function AddInventory() {
	const navigate = useNavigate();

	const categories = [
		"Pet Food & Treats",
		"Health & Wellness",
		"Toys & Entertainment",
		"Grooming & Hygiene",
		"Accessories",
		"Habitat & Comfort",
		"Training Essentials"
	];

	const noExpiryCategories = new Set([
		"Toys & Entertainment",
		"Grooming & Hygiene",
		"Accessories",
		"Habitat & Comfort"
	]);

	const [form, setForm] = useState({
		name: "",
		category: "",
		price: "",
		quantity: "",
		minStockLevel: "10", // NEW: low stock threshold default
		expiryDate: "",
		description: "",
		image: null,
		supplier: "" // NEW: supplier field
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// compute next inventory id on mount (INV-001 ...)
	const [nextId, setNextId] = useState("");
	useEffect(() => {
		const existing = JSON.parse(localStorage.getItem("inventoryItems") || "[]");
		let max = 0;
		existing.forEach(it => {
			const id = (it.inventoryId || "").toString();
			if (id.startsWith("INV-")) {
				const num = parseInt(id.split("-")[1], 10);
				if (!isNaN(num) && num > max) max = num;
			}
		});
		const newId = `INV-${String(max + 1).padStart(3, "0")}`;
		setNextId(newId);
	}, []);

	const needsExpiry = (category) => {
		if (!category) return false;
		return !noExpiryCategories.has(category);
	};

	const handleChange = (e) => {
		const { name, value, files } = e.target;
		if (name === "image") {
			setForm(prev => ({ ...prev, image: files && files[0] ? files[0] : null }));
			return;
		}
		setForm(prev => ({ ...prev, [name]: value }));
	};

	// Reusable: compress image file to dataURL (resizes to maxWidth and reduces quality)
	const fileToCompressedDataUrl = (file, maxWidth = 1024, quality = 0.8) => {
		return new Promise((resolve, reject) => {
			if (!file) return resolve(null);
			const reader = new FileReader();
			reader.onerror = () => reject(new Error("Failed to read file"));
			reader.onload = () => {
				const img = new Image();
				img.onload = () => {
					try {
						const canvas = document.createElement('canvas');
						const ratio = img.width / img.height;
						let width = img.width;
						let height = img.height;
						if (width > maxWidth) {
							width = maxWidth;
							height = Math.round(maxWidth / ratio);
						}
						canvas.width = width;
						canvas.height = height;
						const ctx = canvas.getContext('2d');
						// Draw white background for JPG
						ctx.fillStyle = '#fff';
						ctx.fillRect(0, 0, canvas.width, canvas.height);
						ctx.drawImage(img, 0, 0, width, height);
						// use JPEG to get smaller size
						const dataUrl = canvas.toDataURL('image/jpeg', quality);
						resolve(dataUrl);
					} catch (err) {
						// fallback to original dataURL if any error
						resolve(reader.result);
					}
				};
				img.onerror = () => {
					// can't load image -> return original
					resolve(reader.result);
				};
				img.src = reader.result;
			};
			reader.readAsDataURL(file);
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (isSubmitting) return;
		setIsSubmitting(true);

		try {
			// Basic validation (kept same as before)
			if (!form.name.trim()) { alert("Name is required"); setIsSubmitting(false); return; }
			if (!form.category) { alert("Category is required"); setIsSubmitting(false); return; }
			if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) { alert("Enter valid price"); setIsSubmitting(false); return; }
			if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) { alert("Enter valid quantity"); setIsSubmitting(false); return; }
			if (form.minStockLevel === "" || isNaN(Number(form.minStockLevel)) || Number(form.minStockLevel) < 0) {
				alert("Enter valid Low Stock (minimum) quantity (0 or greater)");
				setIsSubmitting(false);
				return;
			}
			if (needsExpiry(form.category) && !form.expiryDate) { alert("Expiry date is required for this category"); setIsSubmitting(false); return; }

			// Prepare image: compress if present to reduce localStorage usage
			let imageData = null;
			if (form.image && typeof form.image !== "string") {
				try {
					// compress to maxWidth 1024 and quality 0.75 (smaller)
					imageData = await fileToCompressedDataUrl(form.image, 1024, 0.75);
					console.log("Compressed image size (chars):", imageData ? imageData.length : 0);
				} catch (err) {
					console.warn("Image compression failed, will try original:", err);
					// fallback to original conversion
					const fallbackReader = new FileReader();
					imageData = await new Promise((res) => {
						fallbackReader.onload = () => res(fallbackReader.result);
						fallbackReader.onerror = () => res(null);
						fallbackReader.readAsDataURL(form.image);
					});
				}
			} else if (typeof form.image === "string") {
				imageData = form.image;
			}

			// Recompute ID just before saving
			const existing = JSON.parse(localStorage.getItem("inventoryItems") || "[]");
			let max = 0;
			existing.forEach(it => {
				const id = (it.inventoryId || "").toString();
				if (id.startsWith("INV-")) {
					const num = parseInt(id.split("-")[1], 10);
					if (!isNaN(num) && num > max) max = num;
				}
			});
			const assignedId = `INV-${String(max + 1).padStart(3, "0")}`;

			const item = {
				inventoryId: assignedId,
				name: form.name.trim(),
				category: form.category,
				price: Number(form.price),
				quantity: Number(form.quantity),
				minStockLevel: Number(form.minStockLevel) || 0,
				expiryDate: needsExpiry(form.category) ? form.expiryDate : null,
				description: form.description || "",
				image: imageData, // may be null
				supplier: form.supplier?.trim() || "", // NEW persisted field
				createdAt: new Date().toISOString()
			};

			// Try to save with image first, but handle quota exceeded gracefully
			existing.push(item);
			try {
				localStorage.setItem("inventoryItems", JSON.stringify(existing));
			} catch (err) {
				console.error("localStorage.setItem failed on first attempt:", err);
				// If quota exceeded, try to remove image and retry
				if (err && (err.name === "QuotaExceededError" || err.code === 22 || err.code === 1014)) {
					console.warn("Quota exceeded. Retrying without image to save item.");
					// remove image from new item and from any others optionally to free space
					item.image = null;
					// also remove images from existing items (only metadata) until it fits — conservative: remove images from existing array
					const cleaned = existing.map((it) => ({ ...it, image: null }));
					try {
						localStorage.setItem("inventoryItems", JSON.stringify(cleaned));
						// notify that we removed images (optional)
						console.log("Saved inventory without images to avoid quota issues.");
					} catch (err2) {
						console.error("Retry without images also failed:", err2);
						alert("Storage is full. Unable to save inventory. Please clear browser storage or remove some inventory images.");
						setIsSubmitting(false);
						return;
					}
				} else {
					// other error
					throw err;
				}
			}

			// Write a small marker for other tabs/listeners
			try {
				localStorage.setItem('lastInventoryAdded', JSON.stringify({ id: assignedId, ts: Date.now() }));
			} catch (markerErr) { /* ignore */ }

			// Dispatch event so InventoryList updates immediately
			try { window.dispatchEvent(new Event('inventoryUpdated')); } catch (e) { /* ignore */ }

			alert(`Inventory item ${item.inventoryId} saved.`);
			setIsSubmitting(false);
			navigate("/inventory");
		} catch (outerErr) {
			console.error("Failed to add inventory item:", outerErr);
			alert("Failed to add inventory item: " + (outerErr?.message || outerErr));
			setIsSubmitting(false);
		}
	};

	return (
		<div className="add-inventory-wrap">
			<div className="add-inventory-container">
				<h2>Add Inventory Item</h2>
				<form onSubmit={handleSubmit} className="add-inventory-form" noValidate>
					{/* Inventory ID - Read Only */}
					<div className="form-group">
						<label>Inventory ID</label>
						<input
							type="text"
							value={nextId}
							readOnly
							className="readonly-field"
						/>
					</div>

					{/* Item Name */}
					<div className="form-group">
						<label>Item Name</label>
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
						<label>Category</label>
						<select
							name="category"
							value={form.category}
							onChange={handleChange}
							required
						>
							<option value="">-- Select Category --</option>
							{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
						</select>
					</div>

					{/* Price, Quantity and Expiry Date Row */}
					<div className="form-row">
						<div className="form-group">
							<label>
								Price (USD) *
							</label>
							<input
								name="price"
								value={form.price}
								onChange={handleChange}
								type="number"
								step="0.01"
								min="0"
								required
							/>
						</div>
						<div className="form-group">
							<label>Quantity *</label>
							<input
								name="quantity"
								value={form.quantity}
								onChange={handleChange}
								type="number"
								min="0"
								required
							/>
						</div>
						<div className="form-group">
							<label>Low Stock (Min quantity) *</label>
							<input
								name="minStockLevel"
								value={form.minStockLevel}
								onChange={handleChange}
								type="number"
								min="0"
								required
							/>
						</div>
						{needsExpiry(form.category) && (
							<div className="form-group">
								<label>Expiry Date *</label>
								<input
									name="expiryDate"
									value={form.expiryDate}
									onChange={handleChange}
									type="date"
									required
								/>
							</div>
						)}
					</div>

					{/* Description */}
					<div className="form-group">
						<label>Item Description</label>
						<textarea
							name="description"
							value={form.description}
							onChange={handleChange}
							placeholder="Enter item description (optional)"
							rows="3"
						/>
					</div>

					{/* Image Upload */}
					<div className="form-group">
						<label>Image (optional)</label>
						<input
							name="image"
							type="file"
							accept="image/*"
							onChange={handleChange}
						/>
					</div>

					{/* Category */}
					<div className="form-group">
						<label>Supplier</label>
						<input
							type="text"
							name="supplier"
							value={form.supplier}
							onChange={handleChange}
							placeholder="Supplier name (optional)"
						/>
					</div>

					{/* Buttons */}
					<div className="form-buttons">
						<button type="submit" disabled={isSubmitting} className="submit-btn">
							{isSubmitting ? "Saving..." : "Add Item"}
						</button>
						<button type="button" onClick={() => navigate("/inventory")} className="cancel-btn">
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
