import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './UpdateUser.css';

function UpdateUser() {
  const [inputs, setInputs] = useState({});
  const history = useNavigate();
  const id = useParams().id;

  useEffect(() => {
    const fetchHandler = async () => {
      await axios
        .get(`http://localhost:3000/api/users/${id}`)
        .then((res) => res.data)
        .then((data) => setInputs(data.user));
    };
    fetchHandler();
  }, [id]);

  const sendRequest = async () => {
    await axios
      .put(`http://localhost:3000/api/users/${id}`, {
        InvoiceId: Number(inputs.InvoiceId),
        PetOwnerName: String(inputs.PetOwnerName),
        gmail: String(inputs.gmail),
        PetName: String(inputs.PetName),
        serviceDetails: String(inputs.serviceDetails),
        totalAmount: Number(inputs.totalAmount),
        inventoryTotal: Number(inputs.inventoryTotal),
        appointmentTotal: Number(inputs.appointmentTotal),
        discounts: Number(inputs.discounts),
        netAmount: Number(inputs.netAmount),
        paymentMethod: String(inputs.paymentMethod),
        date: new Date(inputs.date),
      })
      .then((res) => res.data);
  };

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendRequest().then(() => history("/userdetails"));
  };

  return (
    <div className="UpdateUser-container">
      <form className="UpdateUser-form" onSubmit={handleSubmit}>
        <h1>Update User</h1>

        <label>InvoiceId</label>
        <input type="text" name="InvoiceId" onChange={handleChange} value={inputs.InvoiceId} required />

        <label>Pet Owner Name</label>
        <input type="text" name="PetOwnerName" onChange={handleChange} value={inputs.PetOwnerName} required />

        <label>Gmail</label>
        <input type="email" name="gmail" onChange={handleChange} value={inputs.gmail} required />

        <label>Pet Name</label>
        <input type="text" name="PetName" onChange={handleChange} value={inputs.PetName} required />

        <label>Service Details</label>
        <input type="text" name="serviceDetails" onChange={handleChange} value={inputs.serviceDetails} required />

        <label>Total Amount</label>
        <input type="number" step="0.01" name="totalAmount" onChange={handleChange} value={inputs.totalAmount} required />

        <label>Inventory Total</label>
        <input type="number" step="0.01" name="inventoryTotal" onChange={handleChange} value={inputs.inventoryTotal} required />

        <label>Appointment Total</label>
        <input type="number" step="0.01" name="appointmentTotal" onChange={handleChange} value={inputs.appointmentTotal} required />

        <label>Discounts</label>
        <input type="number" step="0.01" name="discounts" onChange={handleChange} value={inputs.discounts} required />

        <label>Net Amount</label>
        <input type="number" step="0.01" name="netAmount" onChange={handleChange} value={inputs.netAmount} required />

        <label>Payment Method</label>
        <select name="paymentMethod" onChange={handleChange} value={inputs.paymentMethod} required>
          <option value="">Select</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Online">Online</option>
        </select>

        <label>Date</label>
        <input type="date" name="date" onChange={handleChange} value={inputs.date} required />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default UpdateUser;
