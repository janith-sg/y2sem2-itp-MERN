// src/components/PetCard.jsx
import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Button, CardActionArea, CardActions } from "@mui/material";
import { Link } from "react-router-dom";

const PetCard = ({ pet, onDelete, userRole }) => {
  const handleDelete = () => onDelete(pet._id);

  return (
    <Card sx={{ maxWidth: 345 }}>
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
            <b>Birthday:</b>{" "}
            {pet.birthday ? new Date(pet.birthday).toLocaleDateString() : "N/A"}{" "}
            <br />
            <b>Owner Contact:</b> {pet.ownerContact} <br />
            <b>Owner ID:</b> {pet.ownerId}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions>
        {/* ✅ Only admin can delete */}
        {userRole === "admin" && (
          <Button size="medium" color="primary" onClick={handleDelete}>
            Delete
          </Button>
        )}

        <Link className="btn btn-outline-warning" to={`/showpet/${pet._id}`}>
          Details
        </Link>

        {/* ✅ Only admin can edit */}
        {userRole === "admin" && (
          <Link className="btn btn-outline-success" to={`/updatepet/${pet._id}`}>
            Edit
          </Link>
        )}
      </CardActions>
    </Card>
  );
};

export default PetCard;
