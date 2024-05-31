import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllPapers.css';

const AllPapers = () => {
  const [papers, setPapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/papers');
      setPapers(response.data);
    } catch (err) {
      console.error('Error fetching papers:', err);
      setError('An error occurred while fetching papers');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:5001/api/papers/search?search=${searchTerm}`);
      setPapers(response.data);
    } catch (err) {
      console.error('Error searching papers:', err);
      setError('An error occurred while searching papers');
    }
  };

  return (
    <div className="papers-container">
      <h1>All Papers</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by keyword"
        />
        <button type="submit">Search</button>
      </form>
      <div className="papers-list">
        {papers.map((paper) => (
          <div key={paper.id} className="paper-item">
            <h3>{paper.title}</h3>
            <p>{paper.abstract}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllPapers;
