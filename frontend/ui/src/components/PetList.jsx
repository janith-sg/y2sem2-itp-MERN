// src/components/PetList.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import PetCard from "./PetCard";
import "./PetList.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom"; // 👈 import navigate

const PetList = () => {
  const { user } = useContext(AuthContext);
  const [pets, setPets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPets, setFilteredPets] = useState([]);
  const navigate = useNavigate(); // 👈 create navigate

  // Filter pets based on search query
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = pets.filter((pet) =>
      pet.name.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredPets(filtered);
  }, [searchQuery, pets]);

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
  const onDeleteClick = (id) => {
    axios
      .delete(`http://localhost:3000/api/pets/${id}`)
      .then(() => {
        setPets(pets.filter((pet) => pet._id !== id));
      })
      .catch((err) => {
        console.log("Delete error", err);
      });
  };

  // Generate PDF
  const generatePDF = async () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Image",
      "Pet Name",
      "Pet ID",
      "Species",
      "Breed",
      "Color",
      "Blood Type",
      "Birthday",
      "Owner Contact",
      "Owner ID",
    ];
    const tableRows = [];
    const petImages = [];

    for (const pet of filteredPets) {
      let imgDataUrl = null;
      if (pet.petImage) {
        try {
          const imageUrl = `http://localhost:3000${pet.petImage}`;
          const res = await fetch(imageUrl);
          const blob = await res.blob();
          imgDataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          console.log("Image fetch error:", err);
        }
      }

      tableRows.push([
        "",
        pet.name,
        pet.petId,
        pet.species,
        pet.breed || "",
        pet.color || "",
        pet.bloodType || "",
        pet.birthday ? new Date(pet.birthday).toLocaleDateString() : "",
        pet.ownerContact,
        pet.ownerId,
      ]);

      petImages.push(imgDataUrl);
    }

    doc.text("Pet List", 14, 15);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      didDrawCell: function (data) {
        if (data.column.index === 0 && data.cell.section === "body") {
          const img = petImages[data.row.index];
          if (img) {
            doc.addImage(img, "JPEG", data.cell.x + 1, data.cell.y + 1, 18, 18);
          } else {
            doc.rect(data.cell.x + 1, data.cell.y + 1, 18, 18);
          }
        }
      },
    });

    doc.save("pets.pdf");
  };

  return (
    <div className="Show_PetList">
      <div className="container">
        {/* 🔎 Search */}
        <div className="search-bar" style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Search pets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                />
              ))}
        </div>
      </div>
    </div>
  );
};

export default PetList;
