// src/USER/UserApp.jsx

import { BrowserRouter as Router } from "react-router-dom"
import Layout from "../Components/Layout/Layout"
import UserRoutes from "./Routes/UserRoutes"
import "../CSS/App.css"

function UserApp() {
  return (
    <Router>
      <div className="App">
        {/* FIX from previous step applied here */}
        <Layout pathPrefix="/user"> 
          <UserRoutes />
        </Layout>
      </div>
    </Router>
  )
}

export default UserApp