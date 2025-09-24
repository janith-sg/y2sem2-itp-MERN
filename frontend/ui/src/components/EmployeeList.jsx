// src/components/EmployeeList.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import EmployeeCard from "./EmployeeCard";
import "./EmployeeList.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom"; // ✅ Import Link

const EmployeeList = () => {
  const { user } = useContext(AuthContext); // ✅ get current user
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Filter employees based on search query
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = employees.filter((employee) =>
      employee.name.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  // Fetch all employees
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/employees")
      .then((res) => {
        setEmployees(res.data);
        setFilteredEmployees(res.data);
      })
      .catch(() => {
        console.log("Error while getting employee data");
      });
  }, []);

  // Delete employee
  const onDeleteClick = (id) => {
    axios
      .delete(`http://localhost:3000/api/employees/${id}`)
      .then(() => {
        setEmployees(employees.filter((employee) => employee._id !== id));
      })
      .catch((err) => {
        console.log("Delete error", err);
      });
  };

  // Generate PDF including images
  const generatePDF = async () => {
    const doc = new jsPDF();
    const tableColumn = ["Image", "Employee ID", "Name", "Address", "NIC", "Mobile"];
    const tableRows = [];
    const employeeImages = [];

    for (const emp of filteredEmployees) {
      let imgDataUrl = null;
      if (emp.image) {
        try {
          const imageUrl = `http://localhost:3000${emp.image}`;
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
        "", // image placeholder
        emp.employeeID,
        emp.name,
        emp.address,
        emp.nic,
        emp.mobile,
      ]);

      employeeImages.push(imgDataUrl);
    }

    doc.text("Employee List", 14, 15);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      didDrawCell: function (data) {
        if (data.column.index === 0 && data.cell.section === "body") {
          const img = employeeImages[data.row.index];
          if (img) {
            doc.addImage(img, "JPEG", data.cell.x + 1, data.cell.y + 1, 18, 18);
          } else {
            doc.rect(data.cell.x + 1, data.cell.y + 1, 18, 18);
          }
        }
      },
    });

    doc.save("employees.pdf");
  };

  return (
    <div className="Show_EmployeeList">
      <div className="container">
        {/* 🔎 Search */}
        <div className="search-bar" style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div
          className="button-group"
          style={{ marginBottom: "20px", display: "flex", gap: "10px" }}
        >
          <button type="button" onClick={generatePDF}>
            Download PDF
          </button>

          {/* ✅ Add New Employee button (admin only) */}
          {user?.role === "admin" && (
            <Link to="/insert">
              <button type="button">+ Add New Employee</button>
            </Link>
          )}
        </div>

        {/* Employee List */}
        <div className="list">
          {filteredEmployees.length === 0
            ? "No employees found!"
            : filteredEmployees.map((employee) => (
                <EmployeeCard
                  key={employee._id}
                  employee={employee}
                  onDelete={onDeleteClick}
                  userRole={user?.role}
                />
              ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
