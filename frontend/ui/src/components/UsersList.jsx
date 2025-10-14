import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log("UsersList - Current logged user:", user);
  console.log("UsersList - User role:", user?.role);

  useEffect(() => {
    console.log("UsersList - useEffect triggered");
    if (user) {
      fetchUsers();
    } else {
      console.log("UsersList - No user, setting error");
      setLoading(false);
      setError("Please log in to view this page.");
    }
  }, [user]);

  const fetchUsers = async () => {
    console.log("fetchUsers - Starting...");
    try {
      setLoading(true);
      setError(null);
      
      if (user?.role === 'admin') {
        console.log("fetchUsers - Admin path - showing only regular users (no admins)");
        
        // For admin: Show only regular users who have actually logged in (from localStorage) - exclude admin users
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        console.log("fetchUsers - Registered users from localStorage:", registeredUsers);
        
        // Filter out admin users - only show regular users
        const regularUsers = registeredUsers.filter(localUser => localUser.role !== 'admin');
        console.log("fetchUsers - Filtered regular users (no admins):", regularUsers);
        
        // Convert localStorage users to proper format with profile images
        const loggedUsers = regularUsers.map(localUser => ({
          _id: localUser.id,
          employeeID: localUser.id,
          firstName: localUser.firstName,
          lastName: localUser.lastName,
          name: `${localUser.firstName} ${localUser.lastName}`,
          email: localUser.email,
          mobile: localUser.phone,
          nic: localUser.nicNo,
          city: localUser.city,
          role: localUser.role || 'user', // Preserve actual role
          profileImage: localUser.profileImage,
          image: localUser.profileImage,
          loginTime: localUser.loginTime || 'Unknown'
        }));
        
        console.log("fetchUsers - Final logged users for admin (no admins):", loggedUsers);
        setUsers(loggedUsers);
        
      } else {
        console.log("fetchUsers - User path - showing own profile");
        
        // For regular user: Show only their own profile
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const currentUser = registeredUsers.find(u => 
          u.email && user?.email && 
          u.email.toLowerCase().trim() === user.email.toLowerCase().trim()
        );
        
        if (currentUser) {
          const userProfile = {
            _id: currentUser.id,
            employeeID: currentUser.id,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            name: `${currentUser.firstName} ${currentUser.lastName}`,
            email: currentUser.email,
            mobile: currentUser.phone,
            nic: currentUser.nicNo,
            city: currentUser.city,
            role: 'user',
            profileImage: currentUser.profileImage,
            image: currentUser.profileImage,
            loginTime: currentUser.loginTime || 'Unknown'
          };
          setUsers([userProfile]);
        } else {
          setUsers([]);
        }
      }
    } catch (err) {
      console.log("fetchUsers - Exception:", err);
      setError(`Error loading users: ${err.message}`);
    } finally {
      console.log("fetchUsers - Done, setting loading false");
      setLoading(false);
    }
  };

  // Function to highlight search terms
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark style="background-color: #ffeb3b; padding: 2px 4px; border-radius: 3px; font-weight: bold;">$1</mark>');
  };

  // Search functionality for admin
  useEffect(() => {
    if (user?.role === 'admin') {
      if (!searchTerm.trim()) {
        setFilteredUsers(users);
      } else {
        const filtered = users.filter(userData => {
          const name = (userData.name || '').toLowerCase();
          const firstName = (userData.firstName || '').toLowerCase();
          const lastName = (userData.lastName || '').toLowerCase();
          const employeeID = (userData.employeeID || '').toLowerCase();
          const email = (userData.email || '').toLowerCase();
          const search = searchTerm.toLowerCase().trim();
          
          return name.includes(search) || 
                 firstName.includes(search) || 
                 lastName.includes(search) || 
                 employeeID.includes(search) || 
                 email.includes(search);
        });
        setFilteredUsers(filtered);
      }
    } else {
      setFilteredUsers(users);
    }
  }, [users, searchTerm, user?.role]);

  // Helper function to convert image to base64
  const getImageAsBase64 = (imageSrc) => {
    return new Promise((resolve, reject) => {
      if (!imageSrc) {
        resolve(null);
        return;
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100; // Fixed width for PDF
        canvas.height = 100; // Fixed height for PDF
        
        ctx.drawImage(img, 0, 0, 100, 100);
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataURL);
      };
      
      img.onerror = () => resolve(null);
      img.src = imageSrc;
    });
  };

  // PDF Download functionality for admin only - Simple PDF with user details and profile pictures
  const downloadUsersPDF = async () => {
    if (user?.role !== 'admin') {
      alert('Only administrators can download user details.');
      return;
    }

    try {
      const currentDate = new Date().toLocaleDateString();
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Simple header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('User Management - Users List', 20, 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated: ${currentDate}`, 20, 30);
      doc.text(`Total Users: ${filteredUsers.length}`, 20, 35);
      
      let yPosition = 50;
      
      // Process each user - format with profile pictures
      for (let index = 0; index < filteredUsers.length; index++) {
        const userData = filteredUsers[index];
        
        // Check if we need a new page (more space needed for images)
        if (yPosition > 220) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Get profile image if available
        const profileImageSrc = userData.profileImage || userData.image;
        let imageBase64 = null;
        
        if (profileImageSrc) {
          try {
            imageBase64 = await getImageAsBase64(profileImageSrc);
          } catch (error) {
            console.log(`Could not load image for user ${userData.name}:`, error);
          }
        }
        
        // User number and name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'No Name'}`, 20, yPosition);
        
        // Add profile picture if available
        if (imageBase64) {
          try {
            doc.addImage(imageBase64, 'JPEG', 150, yPosition - 5, 25, 25);
          } catch (error) {
            console.log(`Error adding image to PDF for user ${userData.name}:`, error);
          }
        }
        
        yPosition += 8;
        
        // User details in simple format
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        if (userData.employeeID) {
          doc.text(`   ID: ${userData.employeeID}`, 20, yPosition);
          yPosition += 5;
        }
        
        if (userData.email) {
          doc.text(`   Email: ${userData.email}`, 20, yPosition);
          yPosition += 5;
        }
        
        if (userData.mobile) {
          doc.text(`   Mobile: ${userData.mobile}`, 20, yPosition);
          yPosition += 5;
        }
        
        if (userData.nic) {
          doc.text(`   NIC: ${userData.nic}`, 20, yPosition);
          yPosition += 5;
        }
        
        if (userData.address) {
          doc.text(`   Address: ${userData.address}`, 20, yPosition);
          yPosition += 5;
        }
        
        if (userData.city) {
          doc.text(`   City: ${userData.city}`, 20, yPosition);
          yPosition += 5;
        }
        
        if (userData.role) {
          doc.text(`   Role: ${userData.role}`, 20, yPosition);
          yPosition += 5;
        }
        
        // Extra space between users (more space if image was added)
        yPosition += imageBase64 ? 25 : 8;
      }
      
      // Add page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `Users_List_${timestamp}.pdf`;
      
      // Save and download the PDF
      doc.save(filename);
      
      alert(`PDF downloaded successfully!\nFile: ${filename}\nTotal Users: ${filteredUsers.length}`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const onDeleteClick = async (employeeID) => {
    const userData = users.find(u => u.employeeID === employeeID);
    const userName = userData?.name || 'this user';
    
    if (!window.confirm(`⚠️ Are you sure you want to delete ${userName} (ID: ${employeeID})?\n\nThis action cannot be undone!`)) {
      return;
    }
    
    try {
      // For localStorage users (all our logged users)
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedUsers = registeredUsers.filter(u => u.id !== employeeID);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      
      alert(`✅ User ${userName} (${employeeID}) deleted successfully!`);
      
      // Update the state to remove the deleted user
      setUsers(prevUsers => prevUsers.filter(u => u.employeeID !== employeeID));
      
      // If user deleted their own account and is not admin
      if (userData?.email === user?.email && user?.role !== 'admin') {
        alert('You have deleted your own account. You will be logged out.');
        // Could add logout logic here if needed
      }
    } catch (error) {
      alert(`❌ Error deleting user: ${error.message}`);
    }
  };

  console.log("UsersList - Rendering, loading:", loading, "error:", error, "users:", users.length);

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-3 fs-5">Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger text-center" role="alert" style={{ margin: '50px auto', maxWidth: '600px' }}>
          <h4 className="alert-heading">⚠️ Error</h4>
          <p className="mb-3">{error}</p>
          <button className="btn btn-outline-danger" onClick={fetchUsers}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ background: '#f8f9fa', minHeight: '100vh', padding: '20px 0' }}>
      
      {/* Header with Search and PDF Download for Admin */}
      <div className="mb-4" style={{
        background: user?.role === 'admin' 
          ? 'linear-gradient(135deg, #6c83e8ff 0%, #885bb5ff 100%)' 
          : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        padding: '20px',
        borderRadius: '15px',
        color: 'white',
        margin: '0 20px'
      }}>
        <h2 style={{ margin: '0 0 15px 0', textAlign: 'center' }}>
          {user?.role === 'admin' ? '👑 View Users' : '👤 My Profile'}
        </h2>
        
        {/* Admin Controls */}
        {user?.role === 'admin' && (
          <div className="row align-items-center">
            <div className="col-md-8 mb-2 mb-md-0">
              <div className="input-group" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                <span className="input-group-text" style={{ 
                  backgroundColor: 'white', 
                  border: '2px solid white', 
                  color: '#667eea',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  🔍
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid white',
                    color: '#333',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                />
                {searchTerm && (
                  <button
                    className="btn"
                    type="button"
                    onClick={() => setSearchTerm('')}
                    style={{ 
                      backgroundColor: '#dc3545', 
                      border: '2px solid white', 
                      color: 'white',
                      borderRadius: '0 5px 5px 0',
                      fontWeight: 'bold'
                    }}
                    title="Clear search"
                  >
                    ❌
                  </button>
                )}
              </div>
              {/* Search Tips */}
              <small style={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: '12px', 
                fontStyle: 'italic',
                marginTop: '5px',
                display: 'block'
              }}>
                
              </small>
            </div>
            <div className="col-md-4 text-md-end">
              <button
                onClick={downloadUsersPDF}
                className="btn btn-light"
                style={{
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  padding: '10px 25px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  fontSize: '14px',
                  border: '2px solid white'
                }}
                disabled={filteredUsers.length === 0}
              >
                📄 Download PDF 
              </button>
            </div>
          </div>
        )}
        
        {/* Enhanced Search Results Info */}
        {user?.role === 'admin' && searchTerm && (
          <div className="mt-3 p-3" style={{ 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div className="text-center" style={{ fontSize: '16px', fontWeight: 'bold' }}>
              🔍 Search Results: Found <span style={{ 
                backgroundColor: 'rgba(255,255,255,0.3)', 
                padding: '2px 8px', 
                borderRadius: '15px',
                color: '#fff'
              }}>{filteredUsers.length}</span> user(s) matching "<span style={{ 
                backgroundColor: 'rgba(255,255,255,0.3)', 
                padding: '2px 8px', 
                borderRadius: '15px',
                color: '#fff',
                fontStyle: 'italic'
              }}>{searchTerm}</span>"
            </div>
            {filteredUsers.length === 0 && (
              <div className="text-center mt-2" style={{ fontSize: '14px', opacity: '0.8' }}>
                Try searching with different keywords or check spelling
              </div>
            )}
          </div>
        )}
        
        {/* Show total users when not searching */}
        {user?.role === 'admin' && !searchTerm && (
          <div className="mt-3 text-center" style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#4eb466ff',
            padding: '10px 20px',
            borderRadius: '25px',
            display: 'inline-block',
            border: '2px solid #20c997',
            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
          }}>
            📊 Total Users: {users.length}
          </div>
        )}
      </div>

      {/* Enhanced Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center" style={{ margin: '50px auto', maxWidth: '700px' }}>
          <div className="card" style={{
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            background: user?.role === 'admin' && searchTerm 
              ? 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
              : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
          }}>
            <div className="card-body p-5">
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                {user?.role === 'admin' && searchTerm ? '🔍' : '👥'}
              </div>
              <h3 style={{ 
                color: '#333', 
                fontWeight: 'bold', 
                marginBottom: '15px' 
              }}>
                {user?.role === 'admin' && searchTerm ? '🚫 No Search Results' : '📭 No Users Available'}
              </h3>
              <p style={{ 
                color: '#666', 
                fontSize: '16px', 
                marginBottom: '25px',
                lineHeight: '1.6'
              }}>
                {user?.role === 'admin' && searchTerm 
                  ? (
                    <>
                      No users found matching <strong style={{ 
                        backgroundColor: 'rgba(255,255,255,0.7)', 
                        padding: '2px 8px', 
                        borderRadius: '15px',
                        color: '#333'
                      }}>"{searchTerm}"</strong>
                      <br />
                      <small style={{ color: '#888', fontSize: '14px' }}>
                        Try searching with different keywords, check spelling, or use partial names
                      </small>
                    </>
                  )
                  : 'No users are currently available to display.'
                }
              </p>
              
              {/* Action Buttons */}
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                {user?.role === 'admin' && searchTerm && (
                  <>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setSearchTerm('')}
                      style={{
                        borderRadius: '25px',
                        padding: '10px 25px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(0,123,255,0.3)',
                        border: 'none'
                      }}
                    >
                      🔄 Clear Search & Show All Users
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setSearchTerm(searchTerm.split(' ')[0])}
                      style={{
                        borderRadius: '25px',
                        padding: '10px 25px',
                        fontWeight: 'bold'
                      }}
                    >
                      � Try First Word Only
                    </button>
                  </>
                )}
                
                {user?.role === 'admin' && !searchTerm && (
                  <div style={{ color: '#888', fontSize: '14px' }}>
                    Users will appear here when they register and log in
                  </div>
                )}
              </div>
              
              {/* Search Suggestions for Admin */}
              {user?.role === 'admin' && searchTerm && (
                <div className="mt-4 p-3" style={{
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  borderRadius: '15px',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}>
                  <h6 style={{ color: '#333', marginBottom: '10px' }}>💡 Search Tips:</h6>
                  <div style={{ fontSize: '13px', color: '#666', textAlign: 'left' }}>
                    • Try partial names: "john" instead of "john doe"<br />
                    • Search by ID: "U-01", "U-02", etc.<br />
                    • Use email addresses: "user@example.com"<br />
                    • Search is case-insensitive
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="row" style={{ margin: '0 20px' }}>
          {/* Search Active Indicator */}
          {user?.role === 'admin' && searchTerm && (
            <div className="col-12 mb-4">
              <div className="alert alert-info" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <strong>🔍 Search Active:</strong> Showing {filteredUsers.length} result(s) for "{searchTerm}"
                <button 
                  onClick={() => setSearchTerm('')}
                  className="btn btn-light btn-sm ms-3"
                  style={{ borderRadius: '20px', fontSize: '12px' }}
                >
                  Clear ❌
                </button>
              </div>
            </div>
          )}
          
          {filteredUsers.map((userData, index) => (
            <div key={userData._id || userData.employeeID || index} className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100" style={{
                borderRadius: '15px',
                border: searchTerm ? '3px solid #667eea' : 'none',
                boxShadow: searchTerm 
                  ? '0 8px 25px rgba(102, 126, 234, 0.3)' 
                  : '0 4px 15px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                transform: searchTerm ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}>
                
                {/* Search Match Indicator */}
                {searchTerm && (
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '5px 15px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    ✨ Search Match
                  </div>
                )}
                
                {/* Profile Image Section */}
                <div className="text-center p-3" style={{ background: '#f8f9fa' }}>
                  {userData.profileImage || userData.image ? (
                    <img
                      src={userData.profileImage || userData.image}
                      alt={userData.name || `${userData.firstName} ${userData.lastName}`}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: searchTerm ? "4px solid #667eea" : "4px solid #ffffff",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback icon if no image or image fails to load */}
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      backgroundColor: "#e9ecef",
                      display: (userData.profileImage || userData.image) ? "none" : "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "40px",
                      color: "#6c757d",
                      margin: "0 auto",
                      border: searchTerm ? "4px solid #667eea" : "4px solid #ffffff",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                    }}
                  >
                    👤
                  </div>
                </div>

                <div className="card-body">
                  <h5 
                    className="card-title text-center" 
                    style={{ marginBottom: '15px', color: '#333', fontWeight: 'bold' }}
                    dangerouslySetInnerHTML={{
                      __html: searchTerm 
                        ? highlightSearchTerm(userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'No Name', searchTerm)
                        : userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'No Name'
                    }}
                  />
                  
                  <div style={{ 
                    fontSize: '0.9rem', 
                    background: searchTerm ? 'rgba(102, 126, 234, 0.1)' : '#f8f9fa', 
                    padding: '15px', 
                    borderRadius: '10px',
                    border: searchTerm ? '1px solid rgba(102, 126, 234, 0.3)' : 'none'
                  }}>
                    <p 
                      className="mb-2"
                      dangerouslySetInnerHTML={{
                        __html: `<strong>🆔 ID:</strong> ${searchTerm ? highlightSearchTerm(userData.employeeID, searchTerm) : userData.employeeID}`
                      }}
                    />
                    <p 
                      className="mb-2"
                      dangerouslySetInnerHTML={{
                        __html: `<strong>📧 Email:</strong> ${searchTerm ? highlightSearchTerm(userData.email || 'No email', searchTerm) : (userData.email || 'No email')}`
                      }}
                    />
                    <p className="mb-2"><strong>📱 Mobile:</strong> {userData.mobile || 'No mobile'}</p>
                    <p className="mb-2"><strong>🏙️ City:</strong> {userData.city || 'No city'}</p>
                    
                  </div>
                  
                  <div className="d-flex gap-2 justify-content-center mt-3">
                    <Link to={`/show-employee-details/${userData.employeeID}`} className="btn btn-warning btn-sm" style={{ borderRadius: '20px', fontWeight: 'bold' }}>
                      👁️ Details
                    </Link>
                    {(user?.role === "admin" || userData.email === user?.email) && (
                      <Link to={`/update-employee/${userData.employeeID}`} className="btn btn-success btn-sm" style={{ borderRadius: '20px', fontWeight: 'bold' }}>
                        ✏️ Edit
                      </Link>
                    )}
                    {(user?.role === "admin" || userData.email === user?.email) && (
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => onDeleteClick(userData.employeeID)}
                        style={{ borderRadius: '20px', fontWeight: 'bold' }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersList;
