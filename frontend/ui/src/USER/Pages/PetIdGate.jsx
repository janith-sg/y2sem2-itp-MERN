// src/USER/Pages/PetIdGate.jsx
"use client";

import { useState } from "react";
import { Search, PawPrint } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Corrected relative path for the new structure:
import "../../CSS/App.css"; 

const PetIdGate = () => {
  const [petId, setPetId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    setError("");

    const idString = petId.trim(); // ⬅️ Get the input as a string
    
    // 🛑 MODIFICATION 1: Simple string validation
    if (!idString) {
      setError("Please enter a valid Pet ID (e.g., P-017).");
      return;
    }

    // 1. Store the Pet ID string globally (in localStorage)
    localStorage.setItem("currentPetId", idString); // ⬅️ Store the string

    // 2. Redirect to the User Dashboard (or Records page)
    // We assume the final destination is the Records list after the gate
    navigate("/user/medical-records"); 
  };

  return (
    // 1. Modal Overlay: No inline background style here (let CSS handle the dimming)
    <div className="modal-overlay"> 
      {/* 2. Modal Content: Added GUARANTEED VISUAL STYLES */}
      <div className="modal-content" 
           style={{ 
             maxWidth: '450px', 
             padding: '30px', 
             textAlign: 'center',
             
             // 🛑 VISUAL FIX: Guaranteed background and shadow
             backgroundColor: 'white', 
             border: '1px solid #d1d5db', 
             boxShadow: '0 0 50px rgba(0, 0, 0, 0.4)' 
           }}>
        
        <div className="cute-header" style={{ marginBottom: '20px' }}>
          <PawPrint size={48} color="var(--primary-dark)" style={{ marginBottom: '10px' }}/>
          <h2 className="modal-title" style={{ fontSize: '1.8rem', margin: 0 }}>
            Welcome, Pet Owner!
          </h2>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '5px' }}>
            Enter your pet's unique Pet ID to access their medical records.
          </p>
        </div>

        <form onSubmit={handleSearch} className="search-container" style={{ margin: '20px 0' }}>
          <div className="search" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '5px 10px' }}>
            <Search size={20} style={{ color: 'var(--muted-foreground)' }} />
            <input
              // 🛑 MODIFICATION 2: Changed type from "number" to "text"
              type="text"
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              placeholder="Pet ID (e.g., P-017)" // ⬅️ Updated placeholder
              required
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--foreground)',
                flex: 1,
                padding: '10px'
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '15px' }}>
            Access Records
          </button>
        </form>
        
        {error && <p className="form-error" style={{ color: 'var(--error)' }}>{error}</p>}
      </div>
    </div>
  );
};

export default PetIdGate;