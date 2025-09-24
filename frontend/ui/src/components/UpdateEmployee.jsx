import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./UpdateEmployee.css";

function UpdateEmployee() {
  const [employee, setEmployee] = useState({
    employeeID: "",
    name: "",
    address: "",
    nic: "",
    mobile: "",   // ✅ Added mobile
    image: null,
  });
  const [pets, setPets] = useState([{ petID: "", petName: "" }]);

  const { id } = useParams();
  const navigate = useNavigate();

  // Load existing employee data
  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/employees/${id}`)
      .then((res) => {
        setEmployee({
          employeeID: res.data.employeeID,
          name: res.data.name,
          address: res.data.address,
          nic: res.data.nic,
          mobile: res.data.mobile || "",   // ✅ load mobile
          image: res.data.image || null,
        });
        setPets(res.data.pets && res.data.pets.length > 0 ? res.data.pets : [{ petID: "", petName: "" }]);
      })
      .catch((err) => {
        console.log("Error from Update Employee", err);
      });
  }, [id]);

  const onChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const onFileChange = (e) => {
    setEmployee({ ...employee, image: e.target.files[0] });
  };

  const handlePetChange = (index, field, value) => {
    const newPets = [...pets];
    newPets[index][field] = value;
    setPets(newPets);
  };

  const addPetField = () => {
    setPets([...pets, { petID: "", petName: "" }]);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("employeeID", employee.employeeID);
    formData.append("name", employee.name);
    formData.append("address", employee.address);
    formData.append("nic", employee.nic);
    formData.append("mobile", employee.mobile);   // ✅ Added mobile

    if (employee.image instanceof File) {
      formData.append("image", employee.image);
    }
    formData.append("pets", JSON.stringify(pets));

    axios
      .put(`http://localhost:3000/api/employees/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        navigate(`/showdetails/${id}`);
      })
      .catch((err) => {
        console.log("Error in Update", err);
      });
  };

  return (
    <div className="UpdateEmployee">
      <div className="container">
        <div className="row">
          <div className="col-md-8 m-auto">
            <br />
            <Link to="/" className="btn btn-outline-warning float-left">
              Show Employee List
            </Link>
          </div>
        </div>

        <div className="col-md-8 m-auto">
          <form noValidate onSubmit={onSubmit}>
            <div className="form-group">
              <label>Employee ID</label>
              <input
                type="text"
                name="employeeID"
                className="form-control"
                value={employee.employeeID}
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
                value={employee.name}
                onChange={onChange}
              />
            </div>
            <br />

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={employee.address}
                onChange={onChange}
              />
            </div>
            <br />

            <div className="form-group">
              <label>NIC</label>
              <input
                type="text"
                name="nic"
                className="form-control"
                value={employee.nic}
                onChange={onChange}
              />
            </div>
            <br />

            {/* ✅ Mobile Number Field */}
            <div className="form-group">
              <label>Mobile</label>
              <input
                type="text"
                name="mobile"
                className="form-control"
                value={employee.mobile}
                onChange={onChange}
              />
            </div>
            <br />

            <div className="form-group">
              <label>Upload Image</label>
              <input
                type="file"
                name="image"
                className="form-control"
                onChange={onFileChange}
              />
            </div>
            <br />

            <h4>Pets</h4>
            {pets.map((pet, index) => (
              <div key={index}>
                <input
                  type="text"
                  placeholder="Pet ID"
                  value={pet.petID}
                  onChange={(e) => handlePetChange(index, "petID", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Pet Name"
                  value={pet.petName}
                  onChange={(e) => handlePetChange(index, "petName", e.target.value)}
                />
              </div>
            ))}
            <button type="button" onClick={addPetField}>
              + Add Another Pet
            </button>
            <br /><br />

            <button
              type="submit"
              className="btn btn-outline-info btn-lg btn-block"
            >
              Update Employee
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateEmployee;
