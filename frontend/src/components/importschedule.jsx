import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import Sidebar from './sidebar';
function ScheduleImport() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Here you would typically send the file to your server
      alert('Uploading:', selectedFile);

      // Example using FormData to send the file
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Example fetch request (replace with your API endpoint)
      /*
      fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        console.log('Upload successful:', data);
      })
      .catch(error => {
        console.error('Upload failed:', error);
      });
      */
    } else {
      console.log('No file selected.');
    }
  };

  return (
   
    <div style={{ display: 'flex' }}>
    <Sidebar/>
    <div style={{ flex: 1, padding: '20px' }}>
            <div className="breadcrumbs-container"> 
              <div className="breadcrumbs">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/schedule">Users</Link> <span>Import Schedule</span>
              </div>
            </div>
    <div>
      <input type="file" onChange={handleFileChange} />
      {selectedFile && <p>Selected file: {selectedFile.name}</p>}
      <button onClick={handleUpload}>Upload</button>
    </div>
    </div>
    </div>
  );
}

export default ScheduleImport;