import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Comment = () => {
  const { paperId } = useParams();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/comments/${paperId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/comments`,
        { content, rating, paperId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setContent('');
      setRating('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleComment}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment"
          required
        />
        <input
          type="number"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          placeholder="Rating"
          required
        />
        <button type="submit">Comment</button>
      </form>
      <div>
        {comments.map((comment) => (
          <div key={comment.id}>
            <p>{comment.content}</p>
            <p>Rating: {comment.rating}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comment;
