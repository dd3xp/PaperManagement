import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './MyLibraries.css';

const MyLibraries = () => {
  const history = useHistory();
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [isLibraryVisible, setIsLibraryVisible] = useState(true);
  const [isAddLibraryVisible, setIsAddLibraryVisible] = useState(false);
  const [isSaveToLibraryVisible, setIsSaveToLibraryVisible] = useState(false);
  const [isEditInfoVisible, setIsEditInfoVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [keywords, setKeywords] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState(null);
  const [papers, setPapers] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedLibrary, setSelectedLibrary] = useState('');
  const [newLibraryName, setNewLibraryName] = useState('');
  const [showOptions, setShowOptions] = useState(null);
  const [showLibraryOptions, setShowLibraryOptions] = useState(null);
  const [showPrivacyOptions, setShowPrivacyOptions] = useState(null);
  const [isMoveVisible, setIsMoveVisible] = useState(false);
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [libraryPrivacy, setLibraryPrivacy] = useState({});
  const [editingPaperId, setEditingPaperId] = useState(null);

  const optionsRef = useRef([]);
  const libraryOptionsRef = useRef([]);
  const privacyOptionsRef = useRef([]);

  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/libraries/mylibraries', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setLibraries(response.data);
        const initialPrivacy = response.data.reduce((acc, library) => {
          acc[library.id] = library.permission || 'Public';
          return acc;
        }, {});
        setLibraryPrivacy(initialPrivacy);
      } catch (error) {
        console.error('Error fetching libraries:', error);
      }
    };

    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/libraries/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setFavorites(response.data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchLibraries();
    fetchFavorites();

    const handleClickOutside = (event) => {
      if (!optionsRef.current.some(ref => ref && ref.contains(event.target))) {
        setShowOptions(null);
      }
      if (!libraryOptionsRef.current.some(ref => ref && ref.contains(event.target))) {
        setShowLibraryOptions(null);
      }
      if (!privacyOptionsRef.current.some(ref => ref && ref.contains(event.target))) {
        setShowPrivacyOptions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddPaper = () => {
    clearInfoInputs();
    setIsEditorVisible(true);
    setIsLibraryVisible(false);
    setIsAddLibraryVisible(false);
    setIsSaveToLibraryVisible(false);
    setIsEditInfoVisible(false);
  };

  const handleViewLibraries = () => {
    setIsLibraryVisible(true);
    setIsEditorVisible(false);
    setIsSaveToLibraryVisible(false);
    setSelectedLibrary('');
    setPapers([]);
    clearInfoInputs();
  };

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
    if (pdfFile) {
      formData.append('pdf', pdfFile);
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
      setTitle('');
      setAuthor('');
      setKeywords('');
      setPdfFile(null);
      setError(null);
      setIsSaveToLibraryVisible(false);
      setIsEditorVisible(true);
    } catch (error) {
      console.error('Error saving paper:', error);
      setError('Failed to save paper.');
    }
  };

  const handlePdfChange = (e) => {
    setPdfFile(e.target.files[0]);
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
      setIsAddLibraryVisible(false);
      setNewLibraryName('');
      setError(null);
      const response = await axios.get('http://localhost:5001/api/libraries/mylibraries', {
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

  const handleSaveToLibrary = (libraryId) => {
    setSelectedLibrary(libraryId);
  };

  const handleBackToLibraries = () => {
    setIsLibraryVisible(true);
    setPapers([]);
    setSelectedLibrary('');
    setIsEditInfoVisible(false);
    clearInfoInputs();
  };

  const handleDeletePaper = async (paperId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/papers/${paperId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Paper deleted successfully!');
      handleViewLibrary(selectedLibrary);
    } catch (error) {
      console.error('Error deleting paper:', error);
      setError('Failed to delete paper.');
    }
  };

  const handleDeleteLibrary = async (libraryId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/libraries/${libraryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Library deleted successfully!');
      const response = await axios.get('http://localhost:5001/api/libraries/mylibraries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setLibraries(response.data);
      setSelectedLibrary('');
      setPapers([]);
      setIsLibraryVisible(true);
    } catch (error) {
      console.error('Error deleting library:', error);
      setError('Failed to delete library.');
    }
  };

  const handleMovePaper = (paperId) => {
    setSelectedPaperId(paperId);
    setIsMoveVisible(true);
  };

  const handleConfirmMove = async (targetLibraryId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/papers/${selectedPaperId}/move`, { libraryId: targetLibraryId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Paper moved successfully!');
      setIsMoveVisible(false);
      handleViewLibrary(selectedLibrary);
    } catch (error) {
      console.error('Error moving paper:', error);
      setError('Failed to move paper.');
    }
  };

  const handleEditPaper = (paperId) => {
    window.open(`http://localhost:3000/edit-paper/${paperId}`, '_blank');
  };

  const handleEditInfo = async (paperId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/papers/${paperId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTitle(response.data.title);
      setAuthor(response.data.author);
      setKeywords(response.data.keywords);
      setEditingPaperId(paperId);
      setIsEditInfoVisible(true);
      setIsLibraryVisible(false);
      setIsEditorVisible(false);
      setIsAddLibraryVisible(false);
    } catch (error) {
      console.error('Error fetching paper info:', error);
    }
  };

  const handleSaveInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/papers/${editingPaperId}`, {
        title,
        author,
        keywords
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Paper information updated successfully!');
      setTitle('');
      setAuthor('');
      setKeywords('');
      setEditingPaperId(null);
      setIsEditInfoVisible(false);
      handleViewLibrary(selectedLibrary);
    } catch (error) {
      console.error('Error updating paper info:', error);
      setError('Failed to update paper info.');
    }
  };

  const handleUnfavoriteLibrary = async (libraryId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/api/libraries/${libraryId}/unfavorite`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Library unfavorited successfully!');
      setFavorites(favorites.filter(library => library.id !== libraryId));
    } catch (error) {
      console.error('Error unfavoriting library:', error);
    }
  };

  const toggleOptions = (paperId) => {
    setShowOptions(showOptions === paperId ? null : paperId);
  };

  const toggleLibraryOptions = (libraryId, event) => {
    event.stopPropagation();
    setShowLibraryOptions(showLibraryOptions === libraryId ? null : libraryId);
  };

  const togglePrivacyOptions = (libraryId, event) => {
    event.stopPropagation();
    setShowPrivacyOptions(showPrivacyOptions === libraryId ? null : libraryId);
  };

  const handleLibraryPrivacyChange = async (libraryId, newPrivacy) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/libraries/${libraryId}`, { permission: newPrivacy }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setLibraryPrivacy({ ...libraryPrivacy, [libraryId]: newPrivacy });
      setShowPrivacyOptions(null);
    } catch (error) {
      console.error('Error updating library privacy:', error);
      alert('Failed to update library privacy.');
    }
  };

  const clearInfoInputs = () => {
    setTitle('');
    setAuthor('');
    setKeywords('');
  };

  const handleViewComments = (paperId) => {
    const url = `${window.location.origin}/comments/${paperId}`;
    window.open(url, '_blank'); // 打开一个新页面
  };  

  const handleViewPaper = (paperId) => {
    window.open(`http://localhost:5001/api/papers/pdf/${paperId}`, '_blank');
    setIsEditInfoVisible(false);
  };

  return (
    <div className="my-libraries-container">
      <h1>My Libraries</h1>
      <div className="my-libraries-button-container">
        <button className="my-libraries-add-paper-button" onClick={handleAddPaper}>
          Add Paper
        </button>
        <button className="my-libraries-view-libraries-button" onClick={handleViewLibraries}>
          View Libraries
        </button>
      </div>
      {isLibraryVisible && (
        <div className="my-libraries-list">
          {libraries.length === 0 ? (
            <p className="my-libraries-empty-message">No libraries found</p>
          ) : (
            libraries.map((library, index) => (
              <div
                key={library.id}
                className={`my-libraries-item ${selectedLibrary === library.id ? 'selected' : ''}`}
                style={{ color: 'black' }}
              >
                <div className="my-libraries-library-content">
                  <h3>{library.name}</h3>
                </div>
                <div className="my-libraries-options-container" ref={el => libraryOptionsRef.current[index] = el}>
                  <button className="my-libraries-view-button" onClick={() => handleViewLibrary(library.id)}>View</button>
                  <button className="my-libraries-privacy-button" onClick={(event) => togglePrivacyOptions(library.id, event)}>
                    {libraryPrivacy[library.id] || 'Public'}
                  </button>
                  <button className="my-libraries-options-button" onClick={(event) => toggleLibraryOptions(library.id, event)}>Options</button>
                  {showPrivacyOptions === library.id && (
                    <div className="my-libraries-options-dropdown" ref={el => privacyOptionsRef.current[index] = el}>
                      <button className="my-libraries-privacy-option" onClick={() => handleLibraryPrivacyChange(library.id, 'Private')}>Private</button>
                      <button className="my-libraries-privacy-option" onClick={() => handleLibraryPrivacyChange(library.id, 'Public')}>Public</button>
                      <button className="my-libraries-privacy-option" onClick={() => handleLibraryPrivacyChange(library.id, 'Shared')}>Shared</button>
                    </div>
                  )}
                  {showLibraryOptions === library.id && (
                    <div className="my-libraries-options-dropdown">
                      <button className="my-libraries-delete-library-button" onClick={() => handleDeleteLibrary(library.id)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {favorites.map((library, index) => (
            <div
              key={library.id}
              className={`my-libraries-item favorited-library ${selectedLibrary === library.id ? 'selected' : ''}`}
              style={{ color: 'black' }}
            >
              <div className="my-libraries-library-content">
                <h3>{library.name}</h3>
              </div>
              <div className="my-libraries-options-container" ref={el => libraryOptionsRef.current[index + libraries.length] = el}>
                <button className="my-libraries-view-button" onClick={() => handleViewLibrary(library.id)}>View</button>
                <button className="my-libraries-unfavorite-button" onClick={() => handleUnfavoriteLibrary(library.id)}>Unfavorite</button>
                <button className="my-libraries-options-button" onClick={(event) => toggleLibraryOptions(library.id, event)}>Options</button>
                {showPrivacyOptions === library.id && (
                  <div className="my-libraries-options-dropdown" ref={el => privacyOptionsRef.current[index + libraries.length] = el}>
                    <button className="my-libraries-privacy-option" onClick={() => handleLibraryPrivacyChange(library.id, 'Private')}>Private</button>
                    <button className="my-libraries-privacy-option" onClick={() => handleLibraryPrivacyChange(library.id, 'Public')}>Public</button>
                    <button className="my-libraries-privacy-option" onClick={() => handleLibraryPrivacyChange(library.id, 'Shared')}>Shared</button>
                  </div>
                )}
                {showLibraryOptions === library.id && (
                  <div className="my-libraries-options-dropdown">
                    <button className="my-libraries-delete-library-button" onClick={() => handleDeleteLibrary(library.id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <button className="my-libraries-add-library-button" onClick={() => setIsAddLibraryVisible(true)}>
            Add Library
          </button>
        </div>
      )}
      {isAddLibraryVisible && (
        <div className="my-libraries-add-library-form">
          <input
            type="text"
            value={newLibraryName}
            onChange={(e) => setNewLibraryName(e.target.value)}
            placeholder="Library Name"
          />
          <button onClick={handleAddLibrary} className="my-libraries-save-library-button">Save Library</button>
          {error && <p className="my-libraries-error">{error}</p>}
        </div>
      )}
      {isEditorVisible && (
        <div className="my-libraries-editor-container">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="my-libraries-title-input"
          />
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author"
            className="my-libraries-author-input"
          />
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Keywords (separated by space)"
            className="my-libraries-keywords-input"
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePdfChange}
            className="my-libraries-pdf-input"
          />
          <button onClick={() => setIsSaveToLibraryVisible(true)} className="my-libraries-save-button">Save</button>
          {error && <p className="my-libraries-error">{error}</p>}
        </div>
      )}
      {isSaveToLibraryVisible && (
        <div className="my-libraries-list">
          <p className="library-select-header">Select a library to save the paper:</p>
          {libraries.concat(favorites).map((library) => (
            <div key={library.id} className={`my-libraries-item ${selectedLibrary === library.id ? 'opaque' : ''}`} onClick={() => handleSaveToLibrary(library.id)} style={{ color: 'black' }}>
              <h3>{library.name}</h3>
            </div>
          ))}
          <button onClick={() => { handleSave(); setIsSaveToLibraryVisible(false); }} className="my-libraries-save-button">Confirm Save</button>
        </div>
      )}
      {isMoveVisible && (
        <div className="my-libraries-list">
          <p>Select a library to move the paper to:</p>
          {libraries
            .filter(library => library.id !== selectedLibrary)
            .map((library) => (
              <div key={library.id} className={`my-libraries-item`} onClick={() => handleConfirmMove(library.id)} style={{ color: 'black' }}>
                <h3>{library.name}</h3>
              </div>
            ))}
          <button onClick={() => setIsMoveVisible(false)} className="my-libraries-back-to-libraries-button">Cancel</button>
        </div>
      )}
      {isEditInfoVisible && (
        <div className="my-libraries-editor-container">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="my-libraries-title-input"
          />
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author"
            className="my-libraries-author-input"
          />
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Keywords (separated by space)"
            className="my-libraries-keywords-input"
          />
          <button onClick={handleSaveInfo} className="my-libraries-save-button">Save</button>
          <button onClick={handleBackToLibraries} className="my-libraries-back-to-libraries-button">Back</button>
          {error && <p className="my-libraries-error">{error}</p>}
        </div>
      )}
      {selectedLibrary && !isEditorVisible && !isLibraryVisible && !isMoveVisible && !isEditInfoVisible && (
        <div className="my-libraries-library-papers-container">
          {papers.length === 0 ? (
            <p className="my-libraries-empty-message">No papers found</p>
          ) : (
            <div className="my-libraries-papers-list">
              {papers.map((paper, index) => (
                <div key={paper.id} className="my-libraries-paper-item">
                  <div className="my-libraries-paper-content">
                    <h2>{paper.title}</h2>
                    {paper.author && <p><strong>Author:</strong> {paper.author}</p>}
                    {paper.keywords && <p><strong>Keywords:</strong> {paper.keywords}</p>}
                  </div>
                  <div className="my-libraries-options-container" ref={el => optionsRef.current[index] = el}>
                    <button className="my-libraries-options-button" onClick={() => toggleOptions(paper.id)}>Options</button>
                    {showOptions === paper.id && (
                      <div className="my-libraries-options-dropdown">
                        <button className="my-libraries-view-paper-button" onClick={() => handleViewPaper(paper.id)}>View Paper</button>
                        <button className="my-libraries-move-paper-button" onClick={() => handleMovePaper(paper.id)}>Move</button>
                        <button className="my-libraries-edit-paper-button" onClick={() => handleEditPaper(paper.id)}>Edit</button>
                        <button className="my-libraries-information-button" onClick={() => handleEditInfo(paper.id)}>Information</button>
                        <button className="my-libraries-comment-button" onClick={() => handleViewComments(paper.id)}>Comment</button>
                        <button className="my-libraries-delete-paper-button" onClick={() => handleDeletePaper(paper.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={handleBackToLibraries} className="my-libraries-back-to-libraries-button">Back to Libraries</button>
        </div>
      )}
    </div>
  );
};

export default MyLibraries;
