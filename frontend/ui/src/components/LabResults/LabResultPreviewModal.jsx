// src/Components/LabResults/LabResultPreviewModal.jsx
"use client";
import { X } from "lucide-react";

const isImg  = (u) => /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(u || "");
const isPdf  = (u) => /\.pdf(\?|#|$)/i.test(u || "");
const isVid  = (u) => /\.(mp4|webm|ogg)(\?|#|$)/i.test(u || "");
const isHttp = (u) => /^https?:\/\//i.test(u || "");

const LabResultPreviewModal = ({ url, onClose }) => {
  const src = (url || "").trim();
  if (!src || !isHttp(src)) return null; // preview modal only opens for http(s)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ width: "min(1000px, 90vw)" }}
      >
        <div className="modal-header">
          <h2 className="modal-title">Preview</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 12 }}>
          {isImg(src) && (
            <img src={src} alt="Lab result" style={{ maxWidth: "100%", borderRadius: 8 }} />
          )}

          {isPdf(src) && (
            <iframe
              title="PDF"
              src={src}
              style={{
                width: "100%",
                height: "70vh",
                border: "1px solid var(--border)",
                borderRadius: 8
              }}
            />
          )}

          {isVid(src) && (
            <video src={src} controls style={{ width: "100%", borderRadius: 8 }} />
          )}

          {!isImg(src) && !isPdf(src) && !isVid(src) && (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span>Preview not available for this file type.</span>
              <a href={src} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                Open in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabResultPreviewModal;
