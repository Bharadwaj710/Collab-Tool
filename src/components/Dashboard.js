import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import "./Dashboard.css"; // Import BackgroundEffect

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Define a ref for the "Create New Document" button
  const createButtonRef = useRef(null);

  useEffect(() => {
    // Simulate API call to fetch user's documents
    const fetchDocuments = () => {
      setTimeout(() => {
        const dummyDocuments = [
          { id: 1, title: 'Project Proposal', updatedAt: '2025-03-15T14:22:00Z', collaborators: 3 },
          { id: 2, title: 'Meeting Notes', updatedAt: '2025-03-18T09:45:00Z', collaborators: 2 },
          { id: 3, title: 'Marketing Strategy', updatedAt: '2025-03-20T11:30:00Z', collaborators: 5 }
        ];
        
        setDocuments(dummyDocuments);
        setIsLoading(false);
      }, 1000);
    };
    
    fetchDocuments();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const createNewDocument = () => {
    // Function to handle creation of new document
    console.log('Creating new document');
    // Add implementation logic here
  };

  return (
    <div className="dashboard-container">
      {/* Add BackgroundEffect and pass the createButtonRef */}

      <div className="dashboard-header">
        <h2>My Documents</h2>
        {/* Attach the ref to the "Create New Document" button */}
        <button className="create-btn" onClick={createNewDocument} ref={createButtonRef}>
          Create New Document
        </button>
      </div>
      
      {isLoading ? (
        <div className="loading">Loading your documents...</div>
      ) : (
        <div className="documents-list">
          {documents.length === 0 ? (
            <div className="no-documents">
              <p>You don't have any documents yet. Create your first one!</p>
            </div>
          ) : (
            <table className="documents-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Last Updated</th>
                  <th>Collaborators</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.title}</td>
                    <td>{formatDate(doc.updatedAt)}</td>
                    <td>{doc.collaborators}</td>
                    <td>
                      <button className="action-btn edit">Edit</button>
                      <button className="action-btn share">Share</button>
                      <button className="action-btn delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;