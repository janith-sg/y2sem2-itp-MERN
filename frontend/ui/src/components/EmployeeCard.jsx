import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Button, CardActionArea, CardActions } from "@mui/material";
import { Link } from "react-router-dom";

const EmployeeCard = ({ employee, onDelete, userRole }) => {
  const handleDelete = () => {
    onDelete(employee._id);
  };

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image={
            employee.image
              ? `http://localhost:3000${employee.image}`
              : "https://via.placeholder.com/150"
          }
          alt={employee.name}
        />
        <CardContent>
          <Typography gutterBottom variant="h5">
            {employee.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {employee.employeeID}
            <br />
            {employee.address}
            <br />
            {employee.nic}
            <br />
            {employee.mobile}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions>
        {/* ✅ Only show delete button for admin */}
        {userRole === "admin" && (
          <Button size="medium" color="primary" onClick={handleDelete}>
            Delete
          </Button>
        )}
        <Link className="btn btn-outline-warning" to={`/showdetails/${employee._id}`}>
          Details
        </Link>

        {/* ✅ Optional: Edit button only for admin */}
        {userRole === "admin" && (
          <Link className="btn btn-outline-success" to={`/updatedetails/${employee._id}`}>
            Edit
          </Link>
        )}
      </CardActions>
    </Card>
  );
};

export default EmployeeCard;