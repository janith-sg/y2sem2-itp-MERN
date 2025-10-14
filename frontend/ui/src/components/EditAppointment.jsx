import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function EditAppointment() {
  // accept different param names (id, appointmentId, appId, etc.)
  const params = useParams();
  const paramId = params.id ?? params.appointmentId ?? params.appId ?? Object.values(params)[0];
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    id: "",
    appointmentId: "",
    customerName: "",
    date: "",
    time: "",
    service: "",
    notes: ""
  });
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const load = () => {
      try {
        const list = JSON.parse(localStorage.getItem("appointments") || "[]");
        const found = list.find(a =>
          (a.id && String(a.id) === String(paramId)) ||
          (a.appointmentId && String(a.appointmentId) === String(paramId))
        );
        if (!found) {
          navigate("/appointments");
          return;
        }

        // check owner
        const me = (user?.email || user?.id || user?.employeeID || "").toString();
        const ownerIds = [(found.ownerId || ""), (found.ownerEmail || ""), (found.petOwnerName || "")].map(v => (v||"").toString());
        const owner = ownerIds.includes(me);

        setIsOwner(owner);

        // if not owner, block editing and redirect to the details page
        if (!owner) {
          alert("You can only edit your own appointment.");
          const target = found.id || found.appointmentId || paramId;
          navigate(`/appointment-details/${target}`);
          return;
        }

        setForm({
          id: found.id || found.appointmentId || "",
          appointmentId: found.appointmentId || found.id || "",
          customerName: found.petOwnerName || found.customerName || "",
          date: found.appointmentDate || found.date || "",
          time: found.appointmentTime || found.time || "",
          service: found.serviceType || found.service || "",
          notes: found.notes || ""
        });
      } catch (err) {
        console.error("Error loading appointment for edit:", err);
        navigate("/appointments");
      } finally {
        setLoading(false);
      }
    };

    load();

    // reload when appointments change elsewhere or storage event occurs
    const onUpdated = () => load();
    const onStorage = (e) => { if (e.key === 'appointments') load(); };
    window.addEventListener('appointmentsUpdated', onUpdated);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('appointmentsUpdated', onUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [paramId, navigate, user]);

  const onChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const onSubmit = (e) => {
    e.preventDefault();
    if (!isOwner) {
      alert("You are not authorized to save this appointment.");
      return;
    }
    try {
      const list = JSON.parse(localStorage.getItem("appointments") || "[]");
      const idx = list.findIndex(a =>
        (a.id && String(a.id) === String(paramId)) ||
        (a.appointmentId && String(a.appointmentId) === String(paramId))
      );
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          petOwnerName: form.customerName,
          appointmentDate: form.date,
          appointmentTime: form.time,
          serviceType: form.service,
          notes: form.notes
        };
        localStorage.setItem("appointments", JSON.stringify(list));
        window.dispatchEvent(new Event('appointmentsUpdated'));
        alert("Appointment updated");
        const target = list[idx].id || list[idx].appointmentId || paramId;
        navigate(`/appointment-details/${target}`);
        return;
      }
      navigate("/appointments");
    } catch (err) {
      console.error("Error saving appointment:", err);
      alert("Failed to save appointment. Try again.");
    }
  };

  if (loading) return <div style={{padding:20}}>Loading appointment for edit...</div>;

  return (
    <div style={{padding:20}}>
      <h2>Edit Appointment</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Customer name</label>
          <input name="customerName" value={form.customerName} onChange={onChange} required />
        </div>
        <div>
          <label>Date</label>
          <input name="date" type="date" value={form.date} onChange={onChange} required />
        </div>
        <div>
          <label>Time</label>
          <input name="time" type="time" value={form.time} onChange={onChange} />
        </div>
        <div>
          <label>Service</label>
          <input name="service" value={form.service} onChange={onChange} />
        </div>
        <div>
          <label>Notes</label>
          <textarea name="notes" value={form.notes} onChange={onChange} />
        </div>
        <div style={{marginTop:12}}>
          <button type="submit" className="btn btn-primary">Save</button>
          <button type="button" onClick={() => navigate("/appointments")} className="btn btn-secondary" style={{marginLeft:8}}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default EditAppointment;
