import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function ShowPetDetail() {
  const [pet, setPet] = useState({});
  const { id } = useParams();

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/pets/${id}`)
      .then((res) => setPet(res.data))
      .catch(() => console.log("Error fetching pet details"));
  }, [id]);

  // ✅ Calculate age from birthday
  const getAge = (birthday) => {
    if (!birthday) return "N/A";
    const birthDate = new Date(birthday);
    const diff = new Date() - birthDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365)) + " years";
  };

  return (
    <div
      style={{
        background: "linear-gradient(to right, #f8f9fa, #e9ecef)",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ color: "#343a40", fontSize: "28px", fontWeight: "600", margin: "0" }}>Pet Detail</h1>
        <Link
          to={"/"}
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            padding: "10px 20px",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "500",
            boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
            transition: "background 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#c82333")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")}
        >
          ← Back to main
        </Link>
      </div>

      {/* Pet Card */}
      <div
        style={{
          maxWidth: "900px",
          margin: "30px auto",
          background: "white",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        {pet.petImage && (
          <img
            src={`http://localhost:3000${pet.petImage}`}
            alt={pet.name}
            style={{
              width: "180px",
              height: "180px",
              objectFit: "cover",
              borderRadius: "50%",
              border: "4px solid #17a2b8",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              marginBottom: "20px",
            }}
          />
        )}
        <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#343a40", marginBottom: "5px" }}>
          {pet.name}
        </h2>
        <p style={{ fontSize: "16px", color: "#6c757d", marginBottom: "15px" }}>
          Complete pet details below
        </p>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "15px",
          }}
        >
          <tbody>
            {[
              ["Pet ID", pet.petId],
              ["Name", pet.name],
              ["Species", pet.species],
              ["Breed", pet.breed],
              ["Age", getAge(pet.birthday)],
              ["Owner Contact", pet.ownerContact],
              ["Owner ID", pet.ownerId],
            ].map(([label, value], i) => (
              <tr key={i} style={{ borderBottom: "1px solid #dee2e6" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "10px",
                    color: "#495057",
                    width: "30%",
                  }}
                >
                  {label}
                </th>
                <td style={{ padding: "10px", color: "#212529" }}>{value || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit button (optional) */}
      {/* 
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Link
          to={`/updatepet/${pet._id}`}
          style={{
            backgroundColor: "#17a2b8",
            color: "white",
            padding: "12px 25px",
            borderRadius: "8px",
            fontWeight: "500",
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            transition: "background 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#138496")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#17a2b8")}
        >
          ✏️ Edit Pet
        </Link>
      </div>
      */}
    </div>
  );
}

export default ShowPetDetail;
