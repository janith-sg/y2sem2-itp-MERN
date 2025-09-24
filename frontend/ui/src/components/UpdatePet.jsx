import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./UpdatePet.css";

function UpdatePet() {
  const [pet, setPet] = useState({
    petId: "",
    name: "",
    species: "",
    breed: "",
    bloodType: "",
    color: "",
    birthday: "",
    ownerContact: "",
    ownerId: "",
    petImage: null,
  });

  const { id } = useParams();
  const navigate = useNavigate();

  // Load existing pet data
  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/pets/${id}`)
      .then((res) => {
        setPet({
          petId: res.data.petId,
          name: res.data.name,
          species: res.data.species,
          breed: res.data.breed,
          bloodType: res.data.bloodType,
          color: res.data.color,
          birthday: res.data.birthday ? res.data.birthday.split("T")[0] : "",
          ownerContact: res.data.ownerContact,
          ownerId: res.data.ownerId,
          petImage: res.data.petImage || null,
        });
      })
      .catch((err) => {
        console.log("Error fetching pet data", err);
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

    const formData = new FormData();
    Object.keys(pet).forEach((key) => {
      if (key === "petImage" && pet.petImage instanceof File) {
        formData.append(key, pet.petImage);
      } else if (key !== "petImage") {
        formData.append(key, pet[key]);
      }
    });

    axios
      .put(`http://localhost:3000/api/pets/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        navigate(`/showpet/${id}`);
      })
      .catch((err) => {
        console.log("Error updating pet", err);
      });
  };

  return (
    <div className="UpdatePet">
      <div className="container">
        <div className="row">
          <div className="col-md-8 m-auto">
            <br />
            <Link to="/" className="btn btn-outline-warning float-left">
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
                onChange={onChange}
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
                onChange={onChange}
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
              />
              {pet.petImage && typeof pet.petImage === "string" && (
                <img
                  src={`http://localhost:3000/${pet.petImage.replace("\\", "/")}`}
                  alt={pet.name}
                  style={{ width: "150px", marginTop: "10px" }}
                />
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
