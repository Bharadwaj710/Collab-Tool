import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [joinLink, setJoinLink] = useState('');
  const navigate = useNavigate();

  // Get token directly from localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    // If no token, redirect to login
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDocuments = async () => {
      try {
        // Add this console log to verify token is being sent
        console.log("Fetching documents with token:", token);
        
        const response = await axios.get(`${API_URL}/api/documents`, {
          headers: { 'x-auth-token': token },
        });
        setDocuments(response.data);
      } catch (error) {
        console.error('Error fetching documents:', error);
        
        // Handle unauthorized error
        if (error.response && error.response.status === 401) {
          console.log("Token invalid, redirecting to login");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    };

    // For testing, simulate document data
    const mockDocuments = [
      {
        _id: 'doc1',
        title: 'Sample Document 1',
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'doc2',
        title: 'Project Notes',
        updatedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      }
    ];
    
    // Comment this out when using real API
    setDocuments(mockDocuments);
    
    // Uncomment when ready to use real API
    // fetchDocuments();
  }, [token, navigate]);

  const handleCreateDocument = async () => {
    try {
      // Check token availability
      if (!token) {
        console.log("No token available, redirecting to login");
        navigate('/login');
        return;
      }
      
      console.log("Creating document...");
      console.log("Using token:", token);
      
      // For testing, simulate document creation
      const mockDocument = {
        _id: 'newdoc_' + Math.random().toString(36).substring(2, 9),
        title: `Untitled Document - ${new Date().toLocaleDateString()}`
      };
      
      // Add to documents state
      setDocuments([mockDocument, ...documents]);
      
      // Simulate navigation to new document
      navigate(`/documents/${mockDocument._id}`);
      
      // Comment out when using fake data
      /*
      const response = await axios.post(
        `${API_URL}/api/documents`,
        { title: `Untitled Document - ${new Date().toLocaleDateString()}` },
        { headers: { 'x-auth-token': token } }
      );
      
      console.log("Document created:", response.data);
      navigate(`/documents/${response.data._id}`);
      */
      
    } catch (error) {
      console.error('Error creating document:', error);
      
      if (error.response && error.response.status === 401) {
        alert("Your session has expired. Please login again.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        alert(`Error creating document: ${error.message}`);
      }
    }
  };

  const handleJoinByLink = (e) => {
    e.preventDefault();
    console.log("Join link:", joinLink);
    
    // Better parsing of document ID from link
    let docId;
    if (joinLink.includes('/')) {
      const urlParts = joinLink.split('/');
      docId = urlParts[urlParts.length - 1];
    } else {
      // If user just pasted an ID directly
      docId = joinLink.trim();
    }
    
    console.log("Extracted document ID:", docId);
    
    if (docId) {
      navigate(`/documents/${docId}`);
    } else {
      alert("Please enter a valid document link or ID");
    }
  };
  
  const openDocument = (id) => {
    navigate(`/documents/${id}`);
  };

  return (
    <div className="dashboard">
      <style>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .dashboard h1 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: #333;
          border-bottom: 2px solid #eaeaea;
          padding-bottom: 0.75rem;
        }

        .dashboard h2 {
          font-size: 1.5rem;
          margin: 2rem 0 1rem;
          color: #444;
        }

        .document-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background-color: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .btn {
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background-color: #4285f4;
          color: white;
        }

        .btn-primary:hover {
          background-color: #3367d6;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .btn-secondary {
          background-color: #34a853;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #2d8a46;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .join-form {
          display: flex;
          flex: 1;
          min-width: 300px;
          gap: 0.5rem;
        }

        .join-form input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
        }

        .join-form input:focus {
          outline: none;
          border-color: #4285f4;
          box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
        }

        .document-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .document-card {
          padding: 1.5rem;
          border-radius: 8px;
          background-color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 4px solid #4285f4;
        }

        .document-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .document-card h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .document-card p {
          margin: 0;
          font-size: 0.85rem;
          color: #888;
        }

        @media (max-width: 768px) {
          .document-actions {
            flex-direction: column;
          }

          .join-form {
            width: 100%;
          }
        }
      `}</style>

      <h1>Dashboard</h1>

      <div className="document-actions">
        <button onClick={handleCreateDocument} className="btn btn-primary">
          Create New Document
        </button>

        <form onSubmit={handleJoinByLink} className="join-form">
          <input
            type="text"
            placeholder="Paste document link or ID"
            value={joinLink}
            onChange={(e) => setJoinLink(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">Join</button>
        </form>
      </div>

      <h2>Your Documents</h2>
      {documents.length === 0 ? (
        <p>No documents found. Create a new one!</p>
      ) : (
        <div className="document-list">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="document-card"
              onClick={() => openDocument(doc._id)}
            >
              <h3>{doc.title}</h3>
              <p>Last updated: {new Date(doc.updatedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;