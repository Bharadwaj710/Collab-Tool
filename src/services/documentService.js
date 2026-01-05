// services/documentService.js
import axios from 'axios';

// ✅ Correct Vite env usage
const API_URL = `${import.meta.env.VITE_API_URL}/api/documents`;

// ✅ Correct token source
const getToken = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.error('No auth token found');
    throw new Error('Authentication required');
  }

  return token;
};

// 🔹 GET document by ID
export const getDocumentById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`, {
    headers: {
      'x-auth-token': getToken(),
    },
  });
  return data;
};

// 🔹 UPDATE document
export const updateDocument = async (id, updates) => {
  const { data } = await axios.put(`${API_URL}/${id}`, updates, {
    headers: {
      'x-auth-token': getToken(),
    },
  });
  return data;
};

// 🔹 DELETE document
export const deleteDocument = async (id) => {
  const { data } = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      'x-auth-token': getToken(),
    },
  });
  return data;
};

// 🔹 CREATE document
export const createDocument = async (document) => {
  const { data } = await axios.post(API_URL, document, {
    headers: {
      'x-auth-token': getToken(),
    },
  });
  return data;
};

// 🔹 GET all documents
export const getAllDocuments = async () => {
  const { data } = await axios.get(API_URL, {
    headers: {
      'x-auth-token': getToken(),
    },
  });
  return data;
};
