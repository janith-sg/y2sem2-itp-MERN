// src/Components/Userdetails/Users.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import User from "../User/User";
import "./users.css";

const URL = "http://localhost:3000/api/users";

const fetchHandler = async () => {
  const res = await axios.get(URL);
  // return the most likely payload: an object with `users` or an array
  return res.data?.users ?? res.data;
};

function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHandler();
        // log raw response to help debug missing items
        console.debug("GET /api/users response:", data);
        const final = Array.isArray(data) ? data : data ?? [];
        if (mounted) setUsers(final);
      } catch (err) {
        console.error("Fetch users error:", err);
        if (mounted) setError("Unable to fetch users");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const q = searchTerm.trim().toLowerCase();
  const filteredUsers = q
    ? users.filter((u) => {
        const owner = (u.PetOwnerName ?? "").toString().toLowerCase();
        const pet = (u.PetName ?? "").toString().toLowerCase();
        const mail = (u.gmail ?? "").toString().toLowerCase();
        const inv = (u.InvoiceId ?? "").toString().toLowerCase();
        return owner.includes(q) || pet.includes(q) || mail.includes(q) || inv.includes(q);
      })
    : users;

  return (
    <div className="users-container">
      <h1>Payment Details</h1>

      <div className="users-actions">
        <input
          type="text"
          placeholder="Search by Pet Owner Name, Pet Name, Email or InvoiceId"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => setSearchTerm("")}>Clear</button>
        <button onClick={async () => {
          setLoading(true);
          try {
            const fresh = await fetchHandler();
            setUsers(Array.isArray(fresh) ? fresh : fresh ?? []);
          } catch (e) {
            console.error('Refresh failed', e);
            setError('Unable to fetch users');
          } finally { setLoading(false); }
        }}>Refresh</button>
      </div>

      {loading ? (
        <p className="loading-text">Loading users...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : (
        <div>
          {filteredUsers && filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user._id || user.InvoiceId} className="user-card">
                <User user={user} />
              </div>
            ))
          ) : (
            <p className="no-users-text">
              No users found{q ? ` for "${searchTerm}"` : ""}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Users;
