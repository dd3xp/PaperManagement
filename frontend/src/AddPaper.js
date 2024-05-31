import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './AddPaper.css';

const AddPaper = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const history = useHistory();

  const handleSave = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/papers', {
        title,
        content,
        author: 'current_user', // 在实际应用中应从当前用户状态中获取
        permissions: 'private'
      });
      alert('Paper saved successfully!');
      history.push('/my-libraries');
    } catch (error) {
      console.error('Error saving paper:', error);
      alert('Failed to save paper.');
    }
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
      <ReactQuill value={content} onChange={setContent} className="editor" />
      <button onClick={handleSave} className="save-button">Save</button>
    </div>
  );
};

export default AddPaper;
