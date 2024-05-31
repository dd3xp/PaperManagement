import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Library = () => {
  const [libraries, setLibraries] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    fetchLibraries();
  }, []);

  const fetchLibraries = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/libraries`);
      setLibraries(response.data);
    } catch (error) {
      console.error('Error fetching libraries', error);
    }
  };

  const handleCreateLibrary = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/libraries`,
        { name, description, isPublic },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setName('');
      setDescription('');
      setIsPublic(true);
      fetchLibraries();
    } catch (error) {
      console.error('Error creating library', error);
    }
  };

  return (
    <div>
      <h2>Libraries</h2>
      <form onSubmit={handleCreateLibrary}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Library Name"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Library Description"
        />
        <label>
          Public
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
        </label>
        <button type="submit">Create Library</button>
      </form>
      <div>
        {libraries.map((library) => (
          <div key={library.id}>
            <h3>{library.name}</h3>
            <p>{library.description}</p>
            <Link to={`/papers/${library.id}`}>View Papers</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
