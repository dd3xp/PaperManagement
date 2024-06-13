import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AllPapers.css';

const AllPapers = () => {
  const [papers, setPapers] = useState([]);
  const [search, setSearch] = useState('');
  const [showOptions, setShowOptions] = useState(null);
  const optionsRef = useRef([]);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/papers');
        setPapers(response.data);
      } catch (error) {
        console.error('Error fetching papers:', error);
      }
    };

    fetchPapers();

    const handleClickOutside = (event) => {
      if (!optionsRef.current.some(ref => ref && ref.contains(event.target))) {
        setShowOptions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/papers/search?search=${search}`);
      setPapers(response.data);
    } catch (error) {
      console.error('Error searching papers:', error);
    }
  };

  const toggleOptions = (paperId) => {
    setShowOptions(showOptions === paperId ? null : paperId);
  };

  const viewPaper = (pdfPath) => {
    window.open(`http://localhost:5001/${pdfPath}`, '_blank');
  };

  const handleViewComments = (paperId) => {
    const url = `${window.location.origin}/comments/${paperId}`;
    window.open(url, '_blank'); // 打开一个新页面
  };
  
  return (
    <div className="all-papers-container">
      <h1>All Papers</h1>
      <div className="all-papers-search-container">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search papers..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="all-papers-list">
        {papers.length === 0 ? (
          <p className="all-papers-empty-message">No papers found</p>
        ) : (
          papers.map((paper, index) => (
            <div key={paper.id} className="all-papers-item">
              <div className="all-papers-paper-content">
                <h2>{paper.title}</h2>
                {paper.author && <p><strong>Author:</strong> {paper.author}</p>}
                {paper.keywords && <p><strong>Keywords:</strong> {paper.keywords}</p>}
              </div>
              <div className="all-papers-options-container" ref={el => optionsRef.current[index] = el}>
                <button className="all-papers-options-button" onClick={() => toggleOptions(paper.id)}>Options</button>
                {showOptions === paper.id && (
                  <div className="all-papers-options-dropdown">
                    <button className="all-papers-view-paper-button" onClick={() => viewPaper(paper.pdfPath)}>View Paper</button>
                    <button className="all-papers-comment-button" onClick={() => handleViewComments(paper.id)}>Comment</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllPapers;
