import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

const Paper = () => {
  const { libraryId } = useParams();
  const [papers, setPapers] = useState([]);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/papers/${libraryId}`);
      setPapers(response.data);
    } catch (error) {
      console.error('Error fetching papers', error);
    }
  };

  const handleCreatePaper = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('abstract', abstract);
    formData.append('libraryId', libraryId);
    formData.append('pdf', pdfFile);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/papers`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTitle('');
      setAbstract('');
      setPdfFile(null);
      fetchPapers();
    } catch (error) {
      console.error('Error creating paper', error);
    }
  };

  return (
    <div>
      <h2>Papers</h2>
      <form onSubmit={handleCreatePaper}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Paper Title"
          required
        />
        <textarea
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          placeholder="Paper Abstract"
        />
        <input
          type="file"
          onChange={(e) => setPdfFile(e.target.files[0])}
          required
        />
        <button type="submit">Upload Paper</button>
      </form>
      <div>
        {papers.map((paper) => (
          <div key={paper.id}>
            <h3>{paper.title}</h3>
            <p>{paper.abstract}</p>
            <a href={`${process.env.REACT_APP_API_URL}/${paper.pdfPath}`} target="_blank" rel="noopener noreferrer">Download PDF</a>
            <Link to={`/comments/${paper.id}`}>View Comments</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Paper;
