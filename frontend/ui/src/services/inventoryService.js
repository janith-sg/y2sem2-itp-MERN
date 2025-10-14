// Frontend API service for inventory
const API_BASE_URL = 'http://localhost:3000/api';

export const inventoryService = {
  // Get all inventory items
  async getAllInventory(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.lowStock) queryParams.append('lowStock', filters.lowStock);
      
      const response = await fetch(`${API_BASE_URL}/inventory?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data; // Return the inventory array
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },

  // Get single inventory item
  async getInventoryById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
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
      console.error('Error fetching inventory item:', error);
      throw error;
    }
  },

  // Create new inventory item
  async createInventoryItem(itemData, imageFile = null) {
    try {
      const formData = new FormData();
      
      // Add all item data to form data
      Object.keys(itemData).forEach(key => {
        if (itemData[key] !== null && itemData[key] !== undefined) {
          if (Array.isArray(itemData[key])) {
            formData.append(key, itemData[key].join(','));
          } else {
            formData.append(key, itemData[key]);
          }
        }
      });
      
      // Add image file if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        body: formData, // Don't set Content-Type header for FormData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  },

  // Update inventory item
  async updateInventoryItem(id, itemData, imageFile = null) {
    try {
      const formData = new FormData();
      
      // Add all item data to form data
      Object.keys(itemData).forEach(key => {
        if (itemData[key] !== null && itemData[key] !== undefined) {
          if (Array.isArray(itemData[key])) {
            formData.append(key, itemData[key].join(','));
          } else {
            formData.append(key, itemData[key]);
          }
        }
      });
      
      // Add image file if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  },

  // Delete inventory item
  async deleteInventoryItem(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
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
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },

  // Update stock quantity
  async updateStock(id, stockQuantity, operation, updatedBy) {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stockQuantity,
          operation, // 'add', 'subtract', or 'set'
          updatedBy
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  // Get low stock items
  async getLowStockItems() {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/reports/low-stock`, {
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
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  },

  // Get expiring items
  async getExpiringItems(days = 30) {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/reports/expiring?days=${days}`, {
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
      console.error('Error fetching expiring items:', error);
      throw error;
    }
  }
};