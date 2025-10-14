import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext"; // added to access logged-in user

function ShowEmployeeDetail() {
  const [employee, setEmployee] = useState({});
  const { id } = useParams();
  const { user: authUser } = useAuth(); // logged-in user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Normalize helper
    const normalizeEmail = (e) => (e || "").toLowerCase().trim();
    const normalizeId = (v) => (v || "").toString().trim();

    const loadFromAuthUser = () => {
      if (!authUser) return false;
      // If route id is absent OR matches auth user, prefer showing auth user
      const matchesId =
        !id ||
        normalizeId(id) === normalizeId(authUser.employeeID) ||
        normalizeId(id) === normalizeId(authUser.id) ||
        normalizeId(id) === normalizeId(authUser.userId);
      const matchesEmail = normalizeEmail(id) === normalizeEmail(authUser.email);

      if (matchesId || matchesEmail) {
        // Try to enrich from localStorage registeredUsers if available
        const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        const found = registeredUsers.find(u =>
          (u.email && normalizeEmail(u.email) === normalizeEmail(authUser.email)) ||
          (u.id && normalizeId(u.id) === normalizeId(authUser.employeeID)) ||
          (u.id && normalizeId(u.id) === normalizeId(authUser.id))
        );

        const converted = {
          _id: authUser.employeeID || authUser.id || authUser.userId || found?.id || authUser.email,
          employeeID: authUser.employeeID || authUser.id || authUser.userId || found?.id || authUser.email,
          firstName: authUser.firstName || found?.firstName || "",
          lastName: authUser.lastName || found?.lastName || "",
          name: authUser.firstName || authUser.lastName
            ? `${authUser.firstName || found?.firstName || ""} ${authUser.lastName || found?.lastName || ""}`.trim()
            : found?.name || "",
          email: authUser.email || found?.email || "",
          mobile: found?.phone || found?.mobile || authUser.phone || authUser.mobile || "",
          nic: found?.nicNo || found?.nic || authUser.nic || "",
          address: found?.address || authUser.address || "",
          city: found?.city || authUser.city || "",
          role: authUser.role || found?.role || "user",
          profileImage: found?.profileImage || authUser.profileImage || authUser.image || null,
          image: found?.profileImage || authUser.profileImage || authUser.image || null,
          createdAt: found?.createdAt || authUser.createdAt || null,
          isLocalStorageUser: !!found
        };

        setEmployee(converted);
        setLoading(false);
        return true;
      }
      return false;
    };

    const loadById = async () => {
      try {
        setLoading(true);
        setError(null);

        // If id looks like a local storage user id (U-...), try localStorage
        if (id && id.startsWith("U-")) {
          const localUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
          const localUser = localUsers.find(u => (u.id || "").toString() === id);
          if (localUser) {
            const convertedUser = {
              _id: localUser.id,
              employeeID: localUser.id,
              firstName: localUser.firstName,
              lastName: localUser.lastName,
              name: `${localUser.firstName || ""} ${localUser.lastName || ""}`.trim(),
              email: localUser.email,
              mobile: localUser.phone,
              nic: localUser.nicNo,
              address: localUser.address,
              city: localUser.city,
              role: localUser.role || "user",
              password: localUser.password,
              profileImage: localUser.profileImage,
              image: localUser.profileImage,
              createdAt: localUser.createdAt,
              isLocalStorageUser: true
            };
            setEmployee(convertedUser);
            setLoading(false);
            return;
          } else {
            setError("Local user not found");
            setEmployee({});
            setLoading(false);
            return;
          }
        }

        // Otherwise fetch from backend
        if (id) {
          const res = await axios.get(`http://localhost:3000/api/employees/${id}`);
          setEmployee(res.data || {});
          setLoading(false);
          return;
        }

        // No id provided and not matched to authUser -> try to show authUser if present
        if (!id && authUser) {
          loadFromAuthUser();
          return;
        }

        // nothing to load
        setEmployee({});
        setLoading(false);
      } catch (err) {
        console.error("Error loading employee:", err);
        setError("Failed to load user");
        setEmployee({});
        setLoading(false);
      }
    };

    // Priority: if auth user matches route or route absent -> show auth user
    const handledByAuth = loadFromAuthUser();
    if (!handledByAuth) {
      loadById();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, authUser]);

  // Simple loading / error states
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div className="spinner-border text-primary" role="status" />
        <div>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#d9534f" }}>
        <h3>⚠️ {error}</h3>
        <Link to={"/users"}>Back to Users</Link>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #eaecf1ff 0%, #eae5efff 100%)",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Top Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: "1000px",
        margin: "0 auto 30px auto",
        background: "rgba(244, 239, 239, 0.1)",
        padding: "15px 25px",
        borderRadius: "15px",
        backdropFilter: "blur(10px)"
      }}>
        <div>
          <h1 style={{
            color: "Black",
            fontSize: "32px",
            fontWeight: "700",
            margin: "0",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)"
          }}>
            👤 User Profile
          </h1>

        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link
            to={"/users"}
            style={{
              backgroundColor: "#f33434ff",
              color: "white",
              padding: "12px 24px",
              textDecoration: "none",
              borderRadius: "25px",
              fontWeight: "600",
              boxShadow: "0 4px 15px rgba(255,107,107,0.3)",
              transition: "all 0.3s ease",
              border: "2px solid rgba(255,255,255,0.2)"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(255,107,107,0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0px)";
              e.target.style.boxShadow = "0 4px 15px rgba(255,107,107,0.3)";
            }}
          >
            ← Back to Users
          </Link>

          <Link
            to={`/update-employee/${employee.employeeID || employee._id}`}
            style={{
              backgroundColor: "#ffc107", // yellow
              color: "#212529",
              padding: "12px 20px",
              textDecoration: "none",
              borderRadius: "25px",
              fontWeight: "700",
              boxShadow: "0 6px 18px rgba(255,193,7,0.18)",
              transition: "all 0.18s ease",
              border: "1px solid rgba(0,0,0,0.06)"
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#e0a800";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 22px rgba(224,168,0,0.22)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#ffc107";
              e.target.style.transform = "translateY(0px)";
              e.target.style.boxShadow = "0 6px 18px rgba(255,193,7,0.18)";
            }}
          >
            ✏️ Update Profile
          </Link>
        </div>
      </div>

      {/* Main Profile Card */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          overflow: "hidden",
          position: "relative"
        }}
      >
        {/* Profile Header with Gradient */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "40px 30px 60px 30px",
          textAlign: "center",
          position: "relative"
        }}>
          {/* Profile Image */}
          {(employee.image || employee.profileImage) ? (
            <img
              src={
                employee.isLocalStorageUser
                  ? (employee.profileImage || employee.image)
                  : (employee.image && employee.image.startsWith("http") ? employee.image : `http://localhost:3000${employee.image}`)
              }
              alt={employee.name || `${employee.firstName} ${employee.lastName}`}
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "50%",
                border: "6px solid white",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                marginBottom: "20px",
              }}
              onLoad={() => {
                console.log("✅ Profile image loaded successfully!");
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                console.log("❌ Image failed to load");
              }}
            />
          ) : (
            <div
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                border: "6px solid white",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                marginBottom: "20px",
                backgroundColor: "rgba(255,255,255,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "60px",
                color: "#667eea",
                margin: "0 auto 20px auto"
              }}
            >
              👤
            </div>
          )}

          {/* User Name and Role */}
          <h2 style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "white",
            marginBottom: "10px",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)"
          }}>
            {employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'No Name'}
          </h2>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            background: "rgba(255,255,255,0.2)",
            padding: "8px 20px",
            borderRadius: "25px",
            color: "white",
            fontSize: "16px",
            fontWeight: "600",
            backdropFilter: "blur(10px)"
          }}>
            {employee.role === 'admin' ? '👑' : '👤'} {employee.role?.toUpperCase() || 'USER'}
          </div>
        </div>

        {/* User Information Grid */}
        <div style={{ padding: "40px 30px" }}>
          <h3 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#2c3e50",
            marginBottom: "30px",
            textAlign: "center",
            position: "relative"
          }}>
            📋 Personal Information
            <div style={{
              width: "60px",
              height: "3px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              margin: "10px auto 0 auto",
              borderRadius: "2px"
            }}></div>
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "20px"
          }}>
            {(employee.isLocalStorageUser ? [
              ["🆔 User ID", employee.employeeID],
              ["👤 First Name", employee.firstName],
              ["👤 Last Name", employee.lastName],
              ["📧 Email Address", employee.email],
              ["📱 Mobile Number", employee.mobile],
              ["🆔 NIC Number", employee.nic],
              ["🏠 Address", employee.address],
              ["🏙️ City", employee.city],
              ["👑 Role", employee.role],
              ["📅 Created Date", employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : "—"],
            ] : [
              ["🆔 Employee ID", employee.employeeID],
              ["👤 First Name", employee.firstName],
              ["👤 Last Name", employee.lastName],
              ["👥 Full Name", employee.name],
              ["📧 Email Address", employee.email],
              ["📱 Mobile Number", employee.mobile],
              ["🆔 NIC Number", employee.nic],
              ["🏠 Address", employee.address],
              ["🏙️ City", employee.city],
              ["👑 Role", employee.role],
              ["📅 Created Date", employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : "—"],
            ]).map(([label, value], i) => (
              <div key={i} style={{
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                padding: "20px",
                borderRadius: "15px",
                border: "1px solid #dee2e6",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "default"
              }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0px)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#6c757d",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#2c3e50",
                  wordBreak: "break-word"
                }}>
                  {value || "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pets Section - Only for Database Users */}
      {!employee.isLocalStorageUser && (
        <div
          style={{
            maxWidth: "1000px",
            margin: "20px auto",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            overflow: "hidden"
          }}
        >
          <div style={{
            background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
            padding: "25px 30px",
            textAlign: "center"
          }}>
            <h3 style={{
              color: "white",
              margin: "0",
              fontSize: "24px",
              fontWeight: "700",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)"
            }}>
              🐾 Pet Information
            </h3>
          </div>

          <div style={{ padding: "30px" }}>
            {employee.pets && employee.pets.length > 0 ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px"
              }}>
                {employee.pets.map((pet, index) => (
                  <div
                    key={index}
                    style={{
                      background: "linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)",
                      padding: "20px",
                      borderRadius: "15px",
                      border: "2px solid #ffcccb",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      cursor: "default"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = "0 10px 25px rgba(255,154,158,0.3)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0px)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#e91e63",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      🐾 Pet ID
                    </div>
                    <div style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#2c3e50",
                      marginBottom: "10px"
                    }}>
                      {pet.petID}
                    </div>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#e91e63",
                      marginBottom: "5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      🏷️ Pet Name
                    </div>
                    <div style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#2c3e50"
                    }}>
                      {pet.petName}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "40px",
                color: "#6c757d"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "15px" }}>🐾</div>
                <p style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  margin: "0",
                  fontStyle: "italic"
                }}>
                  No pets registered for this user
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default ShowEmployeeDetail;
