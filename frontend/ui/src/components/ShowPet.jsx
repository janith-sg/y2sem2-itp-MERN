import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ShowPet.css';

const ShowPet = () => {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ownerName, setOwnerName] = useState('Unknown Owner');
  const { petId } = useParams(); // Get petId from URL (e.g., P-012)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPet = async () => {
      try {
        console.log("=== Fetching Pet Details ===");
        console.log("Pet ID from URL:", petId);
        
        setLoading(true);
        
        // Get all pets and find the one with matching petId
        const response = await axios.get('http://localhost:3000/api/pets');
        const pets = response.data;
        
        console.log("All pets:", pets);
        
        // Find pet by petId (not MongoDB _id)
        const foundPet = pets.find(p => p.petId === petId);
        
        if (foundPet) {
          console.log("Found pet:", foundPet);
          setPet(foundPet);
          
          // Try to get owner name from localStorage
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const owner = registeredUsers.find(user => 
            user.email === foundPet.ownerId || 
            user.id === foundPet.ownerId
          );
          
          if (owner) {
            setOwnerName(`${owner.firstName} ${owner.lastName}`);
          } else {
            // If no owner found in localStorage, check if ownerId looks like an email
            if (foundPet.ownerId && foundPet.ownerId.includes('@')) {
              const emailName = foundPet.ownerId.split('@')[0];
              const displayName = emailName.includes('.') 
                ? emailName.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
                : emailName.charAt(0).toUpperCase() + emailName.slice(1);
              setOwnerName(displayName);
            } else {
              setOwnerName('Unknown Owner');
            }
          }
        } else {
          console.log("Pet not found with ID:", petId);
          setError(`Pet with ID ${petId} not found`);
        }
        
      } catch (error) {
        console.error('Error fetching pet:', error);
        setError('Failed to load pet details');
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      fetchPet();
    }
  }, [petId]);

  const handleBack = () => {
    navigate('/pets');
  };

  const handleEdit = async () => {
    try {
      // Since UpdatePet expects MongoDB _id, we need to find it
      const response = await axios.get('http://localhost:3000/api/pets');
      const pets = response.data;
      const foundPet = pets.find(p => p.petId === petId);
      
      if (foundPet) {
        // Navigate to edit pet page using MongoDB _id
        navigate(`/updatepet/${foundPet._id}`);
      } else {
        alert('Pet not found for editing');
      }
    } catch (error) {
      console.error('Error finding pet for edit:', error);
      alert('Failed to find pet for editing');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading pet details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={handleBack} className="btn-back">
            ← Back to Pets
          </button>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>🐾 Pet Not Found</h3>
          <p>The pet you're looking for doesn't exist.</p>
          <button onClick={handleBack} className="btn-back">
            ← Back to Pets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="show-pet-container">
      <div className="pet-details-card">
        {/* Header Section */}
        <div className="pet-header">
             <h1 className="pet-title">🐾 Pet Profile</h1>
          <button onClick={handleBack} className="btn-back">
            ← Back to Pets
          </button>
         
          
        </div>

        {/* Pet Information */}
        <div className="pet-profile">
          {/* Pet Image */}
          <div className="pet-image-section">
            {pet.petImage ? (
              <img 
                src={`http://localhost:3000${pet.petImage}`} 
                alt={pet.name}
                className="pet-image"
                onError={(e) => {
                  e.target.src = '/default-pet.png'; // Fallback image
                }}
              />
            ) : (
              <div className="pet-image-placeholder">
                <span className="placeholder-icon">🐾</span>
                <p>No Image Available</p>
              </div>
            )}
          </div>

          {/* Pet Details Grid */}
          <div className="pet-details-grid">
            <div className="detail-section">
              <h3>📋 Pet Information</h3>
              <div className="detail-row">
                <span className="detail-label">Pet ID:</span>
                <span className="detail-value pet-id">{pet.petId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value pet-name">{pet.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Species:</span>
                <span className="detail-value">{pet.species}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Breed:</span>
                <span className="detail-value">{pet.breed || 'Not specified'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Color:</span>
                <span className="detail-value">{pet.color || 'Not specified'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Blood Type:</span>
                <span className="detail-value">{pet.bloodType || 'Not specified'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{pet.age ? `${pet.age} years` : 'Not specified'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Birthday:</span>
                <span className="detail-value">
                  {pet.birthday ? new Date(pet.birthday).toLocaleDateString() : 'Not specified'}
                </span>
              </div>
            </div>

           

            <div className="detail-section">
              <h3>👤 Owner Information</h3>
              <div className="detail-row">
                <span className="detail-label">Owner Name:</span>
                <span className="detail-value">{ownerName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Owner ID:</span>
                <span className="detail-value">{pet.ownerId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact:</span>
                <span className="detail-value">{pet.ownerContact || 'Not provided'}</span>
              </div>
            </div>

            
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default ShowPet;