import React, { useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function User({ user }) {
  const {
    _id,
    InvoiceId,
    PetOwnerName,
    gmail,
    PetName,
    serviceDetails,
    totalAmount,
    inventoryTotal,
    appointmentTotal,
    discounts,
    netAmount,
    paymentMethod,
    date,
  } = user;

  const userRef = useRef();

  const deleteHandler = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/users/${_id}`);
      window.location.reload();
    } catch (err) {
      console.error("Delete failed:", err.response || err);
      alert("Failed to delete user!");
    }
  };

  const handleDownloadPDF = async () => {
    if (!userRef.current) return;
    try {
      const canvas = await html2canvas(userRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Payment_${InvoiceId}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF.");
    }
  };

  return (
    <div ref={userRef} className="user-card-inner">
      <h3>Payment Details</h3>
      <p><b>ID :</b> {_id}</p>
      <p>Invoice Id: {InvoiceId}</p>
      <p>Pet Owner Name: {PetOwnerName}</p>
      <p>Gmail: {gmail}</p>
      <p>Pet Name: {PetName}</p>
      <p>Service Details: {serviceDetails}</p>
      <p>Total Amount: {totalAmount}</p>
      <p>Inventory Total: {inventoryTotal}</p>
      <p>Appointment Total: {appointmentTotal}</p>
      <p>Discounts: {discounts}</p>
      <p>Net Amount: {netAmount}</p>
      <p>Payment Method: {paymentMethod}</p>
      <p>Date: {new Date(date).toLocaleDateString()}</p>

      <div className="user-actions">
        <Link to={`/userdetails/${_id}`}>
          <button className="update-btn">Update</button>
        </Link>
        <button className="delete-btn" onClick={deleteHandler}>Delete</button>
        <button className="pdf-btn" onClick={handleDownloadPDF}>Download PDF</button>
      </div>
    </div>
  );
}

export default User;
