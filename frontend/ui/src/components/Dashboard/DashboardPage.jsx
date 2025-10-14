"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Syringe, FlaskConical, Pill } from "lucide-react";

import StatsCard from "./StatsCard";
import RecentActivity from "./RecentActivity";
import QuickActions from "./QuickActions"; // Still imported but won't be rendered

import { recordService } from "../../services/recordService";
import { vaccinationService } from "../../services/vaccinationService";
import { labResultService } from "../../services/labResultService";
import { prescriptionService } from "../../services/prescriptionService";

const safeDate = (d) => {
  const x = d ? new Date(d) : null;
  return x && !Number.isNaN(x.getTime()) ? x : null;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  // what we show
  const [counts, setCounts] = useState({
    records: 0,
    vaccinations: 0,
    labResults: 0,
    prescriptions: 0,
  });
  const [activities, setActivities] = useState([]);

  // diagnostics (visible on screen)
  const [diag, setDiag] = useState({
    records: { ok: false, err: "", sample: null },
    vaccinations: { ok: false, err: "", sample: null },
    labresults: { ok: false, err: "", sample: null },
    prescriptions: { ok: false, err: "", sample: null },
  });

  useEffect(() => {
    (async () => {
      setLoading(true);

      // local helpers
      const setOK = (key, list) =>
        setDiag((d) => ({ ...d, [key]: { ok: true, err: "", sample: list?.[0] ?? null } }));
      const setERR = (key, err) =>
        setDiag((d) => ({ ...d, [key]: { ok: false, err: String(err?.message || err), sample: null } }));

      // fetch each resource independently so a failure doesn’t kill the rest
      let records = [];
      try {
        records = await recordService.getAll();
        setOK("records", records);
      } catch (e) {
        console.error("[Dashboard] records load failed:", e);
        setERR("records", e);
      }

      let vax = [];
      try {
        vax = await vaccinationService.getAll();
        setOK("vaccinations", vax);
      } catch (e) {
        console.error("[Dashboard] vaccinations load failed:", e);
        setERR("vaccinations", e);
      }

      let labs = [];
      try {
        labs = await labResultService.getAll();
        setOK("labresults", labs);
      } catch (e) {
        console.error("[Dashboard] lab results load failed:", e);
        setERR("labresults", e);
      }

      let rx = [];
      try {
        // handle both: real endpoint OR a stub/flattened service
        if (typeof prescriptionService?.getAll === "function") {
          rx = await prescriptionService.getAll();
        } else if (typeof prescriptionService?.getAllPrescriptions === "function") {
          rx = await prescriptionService.getAllPrescriptions();
        } else {
          rx = []; // no service — fine
        }
        setOK("prescriptions", rx);
      } catch (e) {
        console.error("[Dashboard] prescriptions load failed:", e);
        setERR("prescriptions", e);
      }

      // update counts (whatever succeeded)
      setCounts({
        records: Array.isArray(records) ? records.length : 0,
        vaccinations: Array.isArray(vax) ? vax.length : 0,
        labResults: Array.isArray(labs) ? labs.length : 0,
        prescriptions: Array.isArray(rx) ? rx.length : 0,
      });

      // build recent activity safely
      const events = [];

      (records || []).forEach((r) => {
        const when = safeDate(r?.createdAt) || safeDate(r?.VisitDate);
        events.push({
          id: `rec-${r?._id || r?.RecordId || Math.random()}`,
          type: "record",
          message: r?.Diagnosis
            ? `Record #${r.RecordId ?? "—"}: ${r.Diagnosis}`
            : `Record #${r.RecordId ?? "—"} created`,
          time: when ? when.toLocaleString() : "—",
          when,
        });
      });

      (vax || []).forEach((v) => {
        const when = safeDate(v?.DateGiven) || safeDate(v?.createdAt);
        events.push({
          id: `vax-${v?._id || v?.VaccinationId || Math.random()}`,
          type: "vaccination",
          message: `${v?.VaccineName || "Vaccine"} completed (Record ${v?.RecordId ?? "—"})`,
          time: when ? when.toLocaleString() : "—",
          when,
        });
      });

      // prescriptions: support both flattened docs and record-shaped items
      (rx || []).forEach((p) => {
        if (Array.isArray(p?.prescriptions)) {
          const first = p.prescriptions[0];
          const when = safeDate(p?.createdAt) || safeDate(p?.VisitDate);
          events.push({
            id: `rxrec-${p?._id || p?.RecordId || Math.random()}`,
            type: "prescription",
            message: first?.name
              ? `Prescription: ${first.name}${first?.dose ? ` (${first.dose})` : ""}`
              : `New prescription (Record ${p?.RecordId ?? "—"})`,
            time: when ? when.toLocaleString() : "—",
            when,
          });
        } else {
          const when =
            safeDate(p?.createdAt) ||
            safeDate(p?.Date) ||
            safeDate(p?.date) ||
            safeDate(p?.issuedAt);
          const name = p?.name ?? p?.drugName ?? p?.medicine ?? p?.medication;
          const dose = p?.dose ?? p?.Dose ?? p?.dosage;
          const rid = p?.RecordId ?? p?.recordId ?? p?._fromRecordId;
          events.push({
            id: `rx-${p?._id || p?.PrescriptionId || Math.random()}`,
            type: "prescription",
            message: name
              ? `Prescription: ${name}${dose ? ` (${dose})` : ""}${rid ? ` (Record ${rid})` : ""}`
              : `New prescription${rid ? ` (Record ${rid})` : ""}`,
            time: when ? when.toLocaleString() : "—",
            when,
          });
        }
      });

      (labs || []).forEach((l) => {
        const when = safeDate(l?.Date) || safeDate(l?.createdAt);
        events.push({
          id: `lab-${l?._id || l?.LabResultId || Math.random()}`,
          type: "lab",
          message: `Lab result (${l?.Type || "lab"}) for Record ${l?.RecordId ?? "—"}`,
          time: when ? when.toLocaleString() : "—",
          when,
        });
      });

      events.sort((a, b) => (b.when?.getTime?.() || 0) - (a.when?.getTime?.() || 0));
      setActivities(events.slice(0, 8));

      setLoading(false);
    })();
  }, []);

  const trend = useMemo(() => "+24%", []); // placeholder

  // The DiagBox component is no longer used in the render function, 
  // but keeping it here for reference in case you need diagnostics later.
  const DiagBox = ({ title, d }) => (
    <div style={{ fontSize: 12, border: "1px dashed var(--border)", padding: 8, borderRadius: 8 }}>
      <strong>{title}</strong>{" "}
      {d.ok ? (
        <span style={{ color: "var(--success)" }}>OK</span>
      ) : (
        <span style={{ color: "var(--error)" }}>ERR</span>
      )}
      {d.err && <div style={{ color: "var(--error)" }}>{d.err}</div>}
      {d.sample && (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>
          {JSON.stringify(d.sample, null, 2)}
        </pre>
      )}
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening at your clinic today.</p>
      </div>

      {/* Stats row */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}
      >
        <StatsCard
          title="Medical Records"
          value={loading ? "…" : counts.records}
          icon={FileText}
          color="success"
          trend={trend}
        />
        <StatsCard
          title="Vaccinations"
          value={loading ? "…" : counts.vaccinations}
          icon={Syringe}
          color="secondary"
        />
        <StatsCard
          title="Prescriptions"
          value={loading ? "…" : counts.prescriptions}
          icon={Pill}
          color="accent"
        />
        <StatsCard
          title="Lab Results"
          value={loading ? "…" : counts.labResults}
          icon={FlaskConical}
          color="warning"
        />
      </div>

      {/* Lower row - MODIFIED */}
      <div className="grid" style={{ gridTemplateColumns: "1fr", gap: "1rem", marginTop: "1rem" }}> 
        {/* The main content area now uses 1 full column */}
        <RecentActivity activities={activities} />
        
        {/* 🛑 REMOVED: QuickActions and Diagnostics Side Panel */}
      </div>
    </div>
  );
}