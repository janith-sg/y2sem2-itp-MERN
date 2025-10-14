import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./UpdatePet.css";

function UpdatePet() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState({
    petId: "",
    name: "",
    species: "",
    breed: "",
    bloodType: "",
    color: "",
    birthday: "",
    age: "",
    ownerContact: "",
    ownerId: "",
    petImage: null,
  });

  const { id } = useParams();
  const navigate = useNavigate();

  // Load existing pet data
  useEffect(() => {
    if (!id) {
      console.error("No pet ID provided");
      alert("No pet ID provided. Redirecting to pets page.");
      navigate("/pets");
      return;
    }

    console.log("Loading pet data for ID:", id);
    setLoading(true);
    
    axios
      .get(`http://localhost:3000/api/pets/${id}`)
      .then((res) => {
        console.log("Pet data received:", res.data);
        setPet({
          petId: res.data.petId || "",
          name: res.data.name || "",
          species: res.data.species || "",
          breed: res.data.breed || "",
          bloodType: res.data.bloodType || "",
          color: res.data.color || "",
          birthday: res.data.birthday ? res.data.birthday.split("T")[0] : "",
          age: res.data.age || "",
          ownerContact: res.data.ownerContact || "",
          ownerId: res.data.ownerId || "",
          petImage: res.data.petImage || null,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching pet data:", err);
        console.error("Error response:", err.response);
        
        if (err.response) {
          // Server responded with error status
          if (err.response.status === 404) {
            alert("Pet not found. Redirecting to pets page.");
            navigate("/pets");
          } else {
            alert(`Error loading pet data: ${err.response.data.message || err.response.data.error || 'Unknown error'}`);
          }
        } else if (err.request) {
          // Request was made but no response received
          alert("Cannot connect to server. Please check if the backend server is running.");
        } else {
          // Something else happened
          alert("Error loading pet data. Please try again.");
        }
        setLoading(false);
      });
  }, [id]);

  const onChange = (e) => {
    setPet({ ...pet, [e.target.name]: e.target.value });
  };

  const onFileChange = (e) => {
    setPet({ ...pet, petImage: e.target.files[0] });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!pet.name || !pet.species || !pet.breed) {
      alert("Please fill in all required fields (Name, Species, Breed)");
      return;
    }

    // Validate age if provided
    if (pet.age && (parseInt(pet.age) < 0 || parseInt(pet.age) > 50)) {
      alert("Pet age must be between 0 and 50 years.");
      return;
    }

    const formData = new FormData();
    Object.keys(pet).forEach((key) => {
      if (key === "petImage" && pet.petImage instanceof File) {
        formData.append(key, pet.petImage);
      } else if (key !== "petImage") {
        formData.append(key, pet[key]);
      }
    });

    console.log("Updating pet with data:", pet);

    axios
      .put(`http://localhost:3000/api/pets/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        console.log("Pet updated successfully:", response.data);
        alert("Pet updated successfully!");
        navigate("/pets");
      })
      .catch((err) => {
        console.log("Error updating pet", err);
        alert("Error updating pet. Please try again.");
      });
  };

  if (loading) {
    return (
      <div className="UpdatePet">
        <div className="container">
          <div className="row">
            <div className="col-md-8 m-auto">
              <br />
              <h2>Loading pet data...</h2>
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="UpdatePet">
      <div className="container">
        <div className="row">
          <div className="col-md-8 m-auto">
            <br />
            <Link to="/pets" className="btn btn-outline-warning float-left">
              Show Pet List
            </Link>
          </div>
        </div>

       

        <div className="col-md-8 m-auto">
          <form noValidate onSubmit={onSubmit}>
            <div className="form-group">
              <label>Pet ID</label>
              <input
                type="text"
                name="petId"
                className="form-control"
                value={pet.petId}
                readOnly
                style={{ backgroundColor: "#f8f9fa", cursor: "not-allowed" }}
              />
            </div>
            <br />

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={pet.name}
                onChange={onChange}
              />
            </div>
            <br />

            <div className="form-group">
              <label>Species</label>
              <select
                name="species"
                className="form-control"
                value={pet.species}
                onChange={onChange}
              >
                <option value="">-- Select Species --</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Bird">Bird</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <br />

            <div className="form-group">
              <label>Breed</label>
              <input
                type="text"
                name="breed"
                className="form-control"
                value={pet.breed}
                onChange={onChange}
              />
            </div>
            <br />

            <div className="form-group">
              <label>Blood Type</label>
              <input
                type="text"
                name="bloodType"
                className="form-control"
                value={pet.bloodType}
                onChange={onChange}
              />
            </div>
            <br />

            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                name="color"
                className="form-control"
                value={pet.color}
                onChange={onChange}
              />
            </div>
            <br />

            <div className="form-group">
              <label>Birthday</label>
              <input
                type="date"
                name="birthday"
                className="form-control"
                value={pet.birthday}
                onChange={onChange}
              />
            </div>
            <br />

            <div className="form-group">
              <label>Age (in years)</label>
              <input
                type="number"
                name="age"
                className="form-control"
                value={pet.age}
                onChange={onChange}
                min="0"
                max="50"
                placeholder="Enter pet's age in years"
              />
            </div>
            <br />

            <div className="form-group">
              <label>Owner Contact</label>
              <input
                type="text"
                name="ownerContact"
                className="form-control"
                value={pet.ownerContact}
                onChange={onChange}
              />
            </div>
            <br />

            <div className="form-group">
              <label>Owner ID</label>
              <input
                type="text"
                name="ownerId"
                className="form-control"
                value={pet.ownerId}
                readOnly
                style={{ backgroundColor: "#f8f9fa", cursor: "not-allowed" }}
              />
            </div>
            <br />

            <div className="form-group">
              <label>Upload Pet Image</label>
              <input
                type="file"
                name="petImage"
                className="form-control"
                onChange={onFileChange}
                accept="image/*"
              />
              {pet.petImage && typeof pet.petImage === "string" && (
                <div style={{ marginTop: "10px" }}>
                  <p><strong>Current Image:</strong></p>
                  <img
                    src={`http://localhost:3000/${pet.petImage.replace("\\", "/")}`}
                    alt={pet.name}
                    style={{ width: "150px", height: "150px", objectFit: "cover", border: "1px solid #ddd", borderRadius: "5px" }}
                  />
                </div>
              )}
              {pet.petImage && typeof pet.petImage === "object" && (
                <div style={{ marginTop: "10px" }}>
                  <p><strong>New Image Selected:</strong></p>
                  <img
                    src={URL.createObjectURL(pet.petImage)}
                    alt="New pet image"
                    style={{ width: "150px", height: "150px", objectFit: "cover", border: "1px solid #ddd", borderRadius: "5px" }}
                  />
                </div>
              )}
            </div>
            <br />

            <button
              type="submit"
              className="btn btn-outline-info btn-lg btn-block"
            >
              Update Pet
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdatePet;
