import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './MyLibraries.css';

const MyLibraries = () => {
  const history = useHistory();
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [isLibraryVisible, setIsLibraryVisible] = useState(false);
  const [isAddLibraryVisible, setIsAddLibraryVisible] = useState(false);
  const [isSaveToLibraryVisible, setIsSaveToLibraryVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [papers, setPapers] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [selectedLibrary, setSelectedLibrary] = useState('');
  const [newLibraryName, setNewLibraryName] = useState('');

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

  const handleAddPaper = () => {
    setIsEditorVisible(true);
    setIsLibraryVisible(false);
    setIsAddLibraryVisible(false);
    setIsSaveToLibraryVisible(false);
    setPapers([]);
  };

  const handleViewLibraries = () => {
    setIsLibraryVisible(true);
    setIsEditorVisible(false);
    setSelectedLibrary('');
    setPapers([]);
  };

  const handleSave = async () => {
    if (!selectedLibrary) {
      setError('Please select a library to save the paper.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/papers', {
        title,
        content,
        permissions: 'private',
        libraryId: selectedLibrary
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (window.confirm('Paper saved successfully! Click OK to add another paper.')) {
        setTitle('');
        setContent('');
        setIsEditorVisible(true);
      } else {
        setIsEditorVisible(false);
      }
      setError(null); // 清除错误状态
      setIsSaveToLibraryVisible(false);
    } catch (error) {
      console.error('Error saving paper:', error);
      setError('Failed to save paper.');
    }
  };

  const handleAddLibrary = async () => {
    if (!newLibraryName) {
      setError('Library name cannot be empty.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/libraries', {
        name: newLibraryName
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Library created successfully!');
      setNewLibraryName('');
      setIsAddLibraryVisible(false);
      setError(null);
      // 刷新文献库列表
      const response = await axios.get('http://localhost:5001/api/libraries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setLibraries(response.data);
    } catch (error) {
      console.error('Error creating library:', error);
      setError('Failed to create library.');
    }
  };

  const handleViewLibrary = async (libraryId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/libraries/${libraryId}/papers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPapers(response.data);
      setSelectedLibrary(libraryId);
      setIsLibraryVisible(false);
      setIsEditorVisible(false);
      setIsAddLibraryVisible(false);
    } catch (error) {
      console.error('Error fetching papers:', error);
    }
  };

  const handleSaveToLibrary = () => {
    setIsSaveToLibraryVisible(true);
  };

  const handleBackToLibraries = () => {
    setIsLibraryVisible(true);
    setPapers([]);
    setSelectedLibrary('');
  };

  return (
    <div className="libraries-container">
      <h1 style={{ marginBottom: '30px' }}>My Libraries</h1>
      <div className="button-container" style={{ marginBottom: '30px' }}>
        <button className="add-paper-button" onClick={handleAddPaper}>
          Add Paper
        </button>
        <button className="view-libraries-button" onClick={handleViewLibraries}>
          View Libraries
        </button>
      </div>
      {isLibraryVisible && (
        <div className="libraries-list">
          {libraries.map((library) => (
            <div key={library.id} className="library-item" onClick={() => handleViewLibrary(library.id)} style={{ color: 'black' }}>
              <h3>{library.name}</h3>
            </div>
          ))}
          <button className="add-library-button" onClick={() => setIsAddLibraryVisible(true)}>
            Add Library
          </button>
        </div>
      )}
      {isAddLibraryVisible && (
        <div className="add-library-form">
          <input
            type="text"
            value={newLibraryName}
            onChange={(e) => setNewLibraryName(e.target.value)}
            placeholder="Library Name"
          />
          <button onClick={handleAddLibrary} className="save-library-button">Save Library</button>
          {error && <p className="error">{error}</p>}
        </div>
      )}
      {isEditorVisible && (
        <div className="editor-container">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="title-input"
          />
          <ReactQuill value={content} onChange={setContent} className="editor" />
          <button onClick={handleSaveToLibrary} className="save-button">Save</button>
          {error && <p className="error">{error}</p>}
        </div>
      )}
      {isSaveToLibraryVisible && (
        <div className="libraries-list">
          <p>Select a library to save the paper:</p>
          {libraries.map((library) => (
            <div key={library.id} className="library-item" onClick={() => { setSelectedLibrary(library.id); handleSave(); }} style={{ color: 'black' }}>
              <h3>{library.name}</h3>
            </div>
          ))}
        </div>
      )}
      {selectedLibrary && !isEditorVisible && !isLibraryVisible && (
        <div className="library-papers-container">
          {papers.length === 0 ? (
            <p>Empty</p>
          ) : (
            <div className="papers-list">
              {papers.map((paper) => (
                <div key={paper.id} className="paper-item">
                  <h2>{paper.title}</h2>
                  <p>{paper.content}</p>
                </div>
              ))}
            </div>
          )}
          <button onClick={handleBackToLibraries} className="back-to-libraries-button">Back to Libraries</button>
        </div>
      )}
    </div>
  );
};

export default MyLibraries;
