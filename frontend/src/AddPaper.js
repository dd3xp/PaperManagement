import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './AddPaper.css';

const AddPaper = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [libraries, setLibraries] = useState([]);
  const [selectedLibrary, setSelectedLibrary] = useState('');
  const history = useHistory();

  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/libraries', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setLibraries(response.data);
      } catch (error) {
        console.error('Error fetching libraries:', error);
      }
    };

    fetchLibraries();
  }, []);

  const handleSave = async () => {
    if (!selectedLibrary) {
      alert('Please select a library');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('keywords', keywords);
    formData.append('permissions', 'private');
    formData.append('libraryId', selectedLibrary);
    if (selectedFile) {
      formData.append('pdf', selectedFile);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/papers', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Paper saved successfully!');
      history.push('/my-libraries');
    } catch (error) {
      console.error('Error saving paper:', error);
      alert('Failed to save paper.');
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div className="add-paper-container">
      <h1>Add New Paper</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="title-input"
      />
      <input
        type="text"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Author"
        className="author-input"
      />
      <input
        type="text"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder="Keywords (separated by space)"
        className="keywords-input"
      />
      <input
        type="file"
        onChange={handleFileChange}
        accept="application/pdf"
        className="file-input"
      />
      <select
        value={selectedLibrary}
        onChange={(e) => setSelectedLibrary(e.target.value)}
        className="library-select"
      >
        <option value="">Select a library</option>
        {libraries.map(library => (
          <option key={library.id} value={library.id}>{library.name}</option>
        ))}
      </select>
      <button onClick={handleSave} className="save-button">Save</button>
    </div>
  );
};

export default AddPaper;
