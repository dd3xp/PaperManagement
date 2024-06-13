import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AllLibraries.css';

const AllLibraries = () => {
  const [libraries, setLibraries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [papers, setPapers] = useState([]);
  const [showOptions, setShowOptions] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const optionsRef = useRef(null);

  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/libraries/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setLibraries(response.data);
      } catch (error) {
        console.error('Error fetching libraries:', error);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/auth/current', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCurrentUserId(response.data.id);
      } catch (error) {
        console.error('Error fetching current user:', error);
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
        setFavorites(response.data.map(library => library.id));
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchLibraries();
    fetchCurrentUser();
    fetchFavorites();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleViewLibrary = async (libraryId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/libraries/${libraryId}/papers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSelectedLibrary(libraryId);
      setPapers(response.data);
    } catch (error) {
      console.error('Error fetching papers:', error);
    }
  };

  const handleBackToLibraries = () => {
    setSelectedLibrary(null);
    setPapers([]);
  };

  const handleFavoriteLibrary = async (libraryId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/api/libraries/${libraryId}/favorite`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setFavorites([...favorites, libraryId]);
    } catch (error) {
      console.error('Error favoriting library:', error);
    }
  };

  const toggleOptions = (paperId) => {
    setShowOptions(showOptions === paperId ? null : paperId);
  };

  const handleViewComments = (paperId) => {
    const url = `${window.location.origin}/comments/${paperId}`;
    window.open(url, '_blank'); // 打开一个新页面
  };

  const filteredLibraries = libraries.filter(library =>
    library.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="all-libraries-container">
      {!selectedLibrary ? (
        <>
          <h1>All Libraries</h1>
          <div className="all-libraries-search-container">
            <input
              type="text"
              placeholder="Search libraries..."
              value={searchInput}
              onChange={handleSearchInputChange}
              className="all-libraries-search-input"
            />
            <button className="all-libraries-search-button" onClick={handleSearch}>Search</button>
          </div>
          <div className="all-libraries-list">
            {filteredLibraries.length > 0 ? (
              filteredLibraries.map((library) => (
                <div key={library.id} className="all-libraries-item">
                  <div className="all-libraries-item-content">
                    <h3>{library.name}</h3>
                    <p><strong>Owner:</strong> user{library.userId}</p>
                  </div>
                  <div className="all-libraries-item-actions">
                    <button className="view-button" onClick={() => handleViewLibrary(library.id)}>View</button>
                    {library.permission === 'Shared' && library.userId !== currentUserId && (
                      favorites.includes(library.id) ? (
                        <button className="favorite-button" disabled>Favorited</button>
                      ) : (
                        <button className="favorite-button" onClick={() => handleFavoriteLibrary(library.id)}>Favorite</button>
                      )
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-libraries-message">No libraries found</p>
            )}
          </div>
        </>
      ) : (
        <div className="all-papers-container">
          <h2>Library Papers</h2>
          <div className="back-button-container">
            <button className="back-button" onClick={handleBackToLibraries}>Back to Libraries</button>
          </div>
          <div className="all-papers-list">
            {papers.map((paper) => (
              <div key={paper.id} className="all-papers-item">
                <div className="all-papers-paper-content">
                  <h2>{paper.title}</h2>
                  {paper.author && <p><strong>Author:</strong> {paper.author}</p>}
                  {paper.keywords && <p><strong>Keywords:</strong> {paper.keywords}</p>}
                </div>
                <div className="all-papers-options-container" ref={optionsRef}>
                  <button className="options-button" onClick={() => toggleOptions(paper.id)}>Options</button>
                  {showOptions === paper.id && (
                    <div className="all-papers-options-dropdown">
                      <button className="view-paper-button" onClick={() => window.open(`http://localhost:5001/api/papers/pdf/${paper.id}`, '_blank')}>View Paper</button>
                      <button className="comment-button" onClick={() => handleViewComments(paper.id)}>Comment</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllLibraries;
