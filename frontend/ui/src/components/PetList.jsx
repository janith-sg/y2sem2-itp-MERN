// src/components/PetList.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import PetCard from "./PetCard";
import "./PetList.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom"; // 👈 import navigate

const PetList = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPets, setFilteredPets] = useState([]);
  const navigate = useNavigate(); // 👈 create navigate

  // Filter pets based on search query AND user ownership
  useEffect(() => {
    console.log("=== FILTERING PETS ===");
    console.log("Current user:", user);
    console.log("Total pets:", pets.length);
    console.log("Search query:", searchQuery);
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    let filtered = pets.filter((pet) => {
      const nameMatch = pet.name.toLowerCase().includes(lowerCaseQuery);
      const idMatch = pet.petId.toLowerCase().includes(lowerCaseQuery);
      return nameMatch || idMatch;
    });

    console.log("After search filter (name + ID):", filtered.length);

    // If user is not admin, show only their own pets
    if (user && user.role !== "admin") {
      console.log("User is not admin, filtering by ownership...");
      const beforeOwnerFilter = filtered.length;
      filtered = filtered.filter((pet) => {
        const isOwner = pet.ownerId === user.email || 
                       pet.ownerId === user.id ||
                       pet.ownerId === user.employeeID;
        console.log(`Pet ${pet.name} (ownerId: ${pet.ownerId}) - User owns: ${isOwner}`);
        return isOwner;
      });
      console.log(`Ownership filter: ${beforeOwnerFilter} -> ${filtered.length} pets`);
    } else if (user && user.role === "admin") {
      console.log("User is admin, showing all pets");
    }
    // If user is admin, show all pets (no additional filtering needed)

    console.log("Final filtered pets:", filtered.length);
    setFilteredPets(filtered);
  }, [searchQuery, pets, user]);

  // Fetch all pets
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/pets")
      .then((res) => {
        setPets(res.data);
        setFilteredPets(res.data);
      })
      .catch(() => {
        console.log("Error while getting pets data");
      });
  }, []);

  // Delete pet
  const onDeleteClick = (mongoId) => {
    console.log("=== DELETE PET CLICKED ===");
    console.log("MongoDB _id to delete:", mongoId);
    
    axios
      .delete(`http://localhost:3000/api/pets/${mongoId}`)
      .then((response) => {
        console.log("✅ Pet deleted successfully!");
        alert(`✅ Pet deleted successfully!`);
        
        // Remove the deleted pet from the local state using MongoDB _id
        setPets(prevPets => prevPets.filter((pet) => pet._id !== mongoId));
        setFilteredPets(prevPets => prevPets.filter((pet) => pet._id !== mongoId));
      })
      .catch((err) => {
        console.error("❌ Delete error:", err);
        
        if (err.response?.status === 404) {
          alert('Pet not found');
        } else if (err.response?.data?.error) {
          alert(`Error deleting pet: ${err.response.data.error}`);
        } else {
          alert('Error deleting pet: ' + err.message);
        }
      });
  };

  // Helper function to convert image to base64
  const getImageAsBase64 = (imageSrc) => {
    return new Promise((resolve, reject) => {
      if (!imageSrc) {
        resolve(null);
        return;
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100; // Fixed width for PDF
        canvas.height = 100; // Fixed height for PDF
        
        ctx.drawImage(img, 0, 0, 100, 100);
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataURL);
      };
      
      img.onerror = () => resolve(null);
      img.src = imageSrc;
    });
  };

  // Generate PDF - Simple format with pet details and images
  const generatePDF = async () => {
    if (!user) {
      alert('Please log in to download pet details.');
      return;
    }

    // Check if user has pets to download
    if (filteredPets.length === 0) {
      alert('No pets available to download.');
      return;
    }

    try {
      const currentDate = new Date().toLocaleDateString();
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Simple header with user-specific title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      const titleText = user.role === 'admin' ? 'Pet Management - All Pets List' : 'Pet Management - My Pets List';
      doc.text(titleText, 20, 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated: ${currentDate}`, 20, 30);
      doc.text(`Total Pets: ${filteredPets.length}`, 20, 35);
      
      if (user.role === 'admin') {
        doc.text('Generated by: Administrator', 20, 40);
      } else {
        // Extract name from email (e.g., john.doe@gmail.com -> John Doe)
        const emailName = user.email.split('@')[0];
        const displayName = emailName.includes('.') 
          ? emailName.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
          : emailName.charAt(0).toUpperCase() + emailName.slice(1);
        doc.text(`Pet Owner: ${displayName} (${user.email})`, 20, 40);
      }
      
      let yPosition = 55; // Start lower to accommodate extra header line
      
      // Process each pet - format with pet images
      for (let index = 0; index < filteredPets.length; index++) {
        const petData = filteredPets[index];
        
        // Check if we need a new page (more space needed for images)
        if (yPosition > 220) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Get pet image if available
        const petImageSrc = petData.petImage ? `http://localhost:3000${petData.petImage}` : null;
        let imageBase64 = null;
        
        if (petImageSrc) {
          try {
            imageBase64 = await getImageAsBase64(petImageSrc);
          } catch (error) {
            console.log(`Could not load image for pet ${petData.name}:`, error);
          }
        }
        
        // Pet number and name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${petData.name || 'No Name'}`, 20, yPosition);
        
        // Add pet picture if available
        if (imageBase64) {
          try {
            doc.addImage(imageBase64, 'JPEG', 150, yPosition - 5, 25, 25);
          } catch (error) {
            console.log(`Error adding image to PDF for pet ${petData.name}:`, error);
          }
        }
        
        yPosition += 8;
        
        // Pet details in simple format
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        if (petData.petId) {
          doc.text(`   Pet ID: ${petData.petId}`, 20, yPosition);
          yPosition += 5;
        }
        
        if (petData.species) {
          doc.text(`   Species: ${petData.species}`, 20, yPosition);
          yPosition += 5;
        }
        
        if (petData.breed) {
          doc.text(`   Breed: ${petData.breed}`, 20, yPosition);
          yPosition += 5;
        }
        
        if (petData.color) {
          doc.text(`   Color: ${petData.color}`, 20, yPosition);
          yPosition += 5;
        }
        
        if (petData.bloodType) {
          doc.text(`   Blood Type: ${petData.bloodType}`, 20, yPosition);
          yPosition += 5;
        }
        
        if (petData.birthday) {
          doc.text(`   Birthday: ${new Date(petData.birthday).toLocaleDateString()}`, 20, yPosition);
          yPosition += 5;
        }
        
        if (petData.ownerContact) {
          doc.text(`   Owner Contact: ${petData.ownerContact}`, 20, yPosition);
          yPosition += 5;
        }
        
        if (petData.ownerId) {
          doc.text(`   Owner ID: ${petData.ownerId}`, 20, yPosition);
          yPosition += 5;
        }
        
        // Extra space between pets (more space if image was added)
        yPosition += imageBase64 ? 25 : 8;
      }
      
      // Add page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }
      
      // Generate filename based on user role
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = user.role === 'admin' 
        ? `All_Pets_List_${timestamp}.pdf`
        : `My_Pets_List_${timestamp}.pdf`;
      
      // Save and download the PDF
      doc.save(filename);
      
      const successMessage = user.role === 'admin'
        ? `PDF downloaded successfully!\nFile: ${filename}\nTotal Pets in System: ${filteredPets.length}`
        : `PDF downloaded successfully!\nFile: ${filename}\nYour Pets: ${filteredPets.length}`;
      
      alert(successMessage);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="Show_PetList">
      <div className="container">
        {/* User info and pet count */}
       

        {/* 🔎 Search */}
        <div className="search-bar" style={{ marginBottom: "15px" }}>
         
          <input
            type="text"
            placeholder="Enter pet name or pet ID (e.g., 'Buddy' or 'P-001')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "2px solid #dee2e6",
              borderRadius: "5px",
              fontSize: "14px"
            }}
          />
        </div>

        {/* Buttons */}
        <div
          className="button"
          style={{ marginBottom: "20px", display: "flex", gap: "10px" }}
        >
          <button type="button" onClick={generatePDF}>
            Download PDF
          </button>
          <button type="button" onClick={() => navigate("/insertpet")}>
            + Add New Pet
          </button>
        </div>

        {/* Pet List */}
        <div className="list">
          {filteredPets.length === 0
            ? "No pets found!"
            : filteredPets.map((pet) => (
                <PetCard
                  key={pet._id}
                  pet={pet}
                  onDelete={onDeleteClick}
                  userRole={user?.role}
                  currentUser={user}
                />
              ))}
        </div>
      </div>
    </div>
  );
};

export default PetList;
