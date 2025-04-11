// services/documentService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/documents';

const getToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.token) {
      console.error('No token found in localStorage');
      throw new Error('Authentication required');
    }
    return user.token;
  };

export const getDocumentById = async (id) => {
    const { data } = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    return data;
};

export const updateDocument = async (id, updates) => {
    const { data } = await axios.put(`${API_URL}/${id}`, updates, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    return data;
};

export const deleteDocument = async (id) => {
    const { data } = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    return data;
};

export const createDocument = async (document) => {
    const { data } = await axios.post(`${API_URL}`, document, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    return data;
};

export const getAllDocuments = async () => {
    const { data } = await axios.get(`${API_URL}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    return data;
};
