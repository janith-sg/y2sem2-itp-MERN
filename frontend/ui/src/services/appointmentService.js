// Frontend API service for appointments
const API_BASE_URL = 'http://localhost:3000/api';

export const appointmentService = {
  // Get all appointments
  async getAllAppointments(userRole, userId, userEmail) {
    try {
      const queryParams = new URLSearchParams();
      if (userRole !== 'admin' && userId) {
        queryParams.append('userId', userId);
      }
      if (userRole !== 'admin' && userEmail) {
        queryParams.append('userEmail', userEmail);
      }
      queryParams.append('role', userRole);
      
      const response = await fetch(`${API_BASE_URL}/appointments?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data; // Return the appointments array
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Get single appointment
  async getAppointmentById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  },

  // Create new appointment
  async createAppointment(appointmentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // Update appointment
  async updateAppointment(id, appointmentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  // Delete appointment
  async deleteAppointment(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },

  // Search appointments
  async searchAppointments(query, userRole, userId, userEmail) {
    try {
      const queryParams = new URLSearchParams();
      if (userRole !== 'admin' && userId) {
        queryParams.append('userId', userId);
      }
      if (userRole !== 'admin' && userEmail) {
        queryParams.append('userEmail', userEmail);
      }
      queryParams.append('role', userRole);
      
      const response = await fetch(`${API_BASE_URL}/appointments/search/${encodeURIComponent(query)}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error searching appointments:', error);
      throw error;
    }
  },

  // Update appointment status
  async updateAppointmentStatus(id, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }
};