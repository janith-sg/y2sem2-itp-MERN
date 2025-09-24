import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function ShowEmployeeDetail() {
  const [employee, setEmployee] = useState({});
  const { id } = useParams();

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/employees/${id}`)
      .then((res) => setEmployee(res.data))
      .catch(() => console.log("Error from ShowEmployeeDetail"));
  }, [id]);

  return (
    <div
      style={{
        background: "linear-gradient(to right, #f8f9fa, #e9ecef)",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ color: "#343a40", fontSize: "28px", fontWeight: "600", margin: "0" }}>Employee Detail</h1>
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

      {/* Employee Card */}
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
        {employee.image && (
          <img
            src={`http://localhost:3000${employee.image}`}
            alt={employee.name}
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
          {employee.name}
        </h2>
        <p style={{ fontSize: "16px", color: "#6c757d", marginBottom: "15px" }}>
          Complete employee details below
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
              ["ID", employee.employeeID],
              ["Name", employee.name],
              ["Address", employee.address],
              ["NIC", employee.nic],
              ["Mobile", employee.mobile],
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

      {/* Pets Section */}
      <div
        style={{
          maxWidth: "900px",
          margin: "20px auto",
          background: "white",
          padding: "25px",
          borderRadius: "15px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ color: "#17a2b8", marginBottom: "15px" }}>🐾 Pets</h3>
        {employee.pets && employee.pets.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, fontSize: "16px" }}>
            {employee.pets.map((pet, index) => (
              <li
                key={index}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #e9ecef",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontWeight: "600", color: "#343a40" }}>{pet.petID}</span>
                <span style={{ color: "#6c757d" }}>{pet.petName}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#6c757d", fontStyle: "italic" }}>No pets registered</p>
        )}
      </div>
    </div>
  );
}

export default ShowEmployeeDetail;
