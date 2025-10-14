// src/components/PetCard.jsx
import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Button, CardActionArea, CardActions } from "@mui/material";
import { Link } from "react-router-dom";
import "./PetCard.css";

const PetCard = ({ pet, onDelete, userRole, currentUser }) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${pet.name}?`)) {
      onDelete(pet._id);
    }
  };

  // Check if current user can edit/delete this pet
  const canEditDelete = userRole === "admin" || 
                       (currentUser && (
                         pet.ownerId === currentUser.email || 
                         pet.ownerId === currentUser.id ||
                         pet.ownerId === currentUser.employeeID
                       ));

  return (
    <Card className="pet-card" sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image={
            pet.petImage
              ? `http://localhost:3000${pet.petImage.replace(/\\/g, "/")}`
              : "https://via.placeholder.com/150"
          }
          alt={pet.name}
        />
        <CardContent>
          <Typography gutterBottom variant="h5">
            {pet.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <b>ID:</b> {pet.petId} <br />
            <b>Species:</b> {pet.species} <br />
            <b>Breed:</b> {pet.breed} <br />
            <b>Color:</b> {pet.color} <br />
            <b>Blood Type:</b> {pet.bloodType} <br />
            <b>Age:</b> {pet.age ? `${pet.age} years` : 'Not specified'} <br />
            <b>Birthday:</b>{" "}
            {pet.birthday ? new Date(pet.birthday).toLocaleDateString() : "N/A"}{" "}
            <br />
            <b>Owner Contact:</b> {pet.ownerContact} <br />
            <b>Owner ID:</b> {pet.ownerId}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions className="pet-card-actions">
        {/* Details Button - Available for all users - Uses petId */}
        <Link 
          className="btn btn-outline-warning" 
          to={`/showpet/${pet.petId}`}
        >
          👁️ Details
        </Link>

        {/* Edit Button - Admin or pet owner can edit - Uses MongoDB _id */}
        {canEditDelete && (
          <Link 
            className="btn btn-outline-success" 
            to={`/updatepet/${pet._id}`}
          >
            ✏️ Edit
          </Link>
        )}

        {/* Delete Button - Admin or pet owner can delete */}
        {canEditDelete && (
          <Button 
            size="medium" 
            color="error" 
            variant="contained"
            onClick={handleDelete}
          >
            🗑️ Delete
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default PetCard;
