// PaymentNavWithButtons.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './nav.css'; // External CSS for styling

function Nav() {
  return (
    <div className="nav-container">
      <ul className="nav-ul">
        
        <li>
          <Link to="/user" className="nav-link">Add Payment</Link>
        </li>
        <li>
          <Link to="/userdetails" className="nav-link">Payment Details</Link>
        </li>
      </ul>
      
    </div>
    
  );
}

export default Nav;
