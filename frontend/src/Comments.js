import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Comments.css';

const Comments = () => {
  const { paperId } = useParams();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(null); // 确保初始值为null
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userHasRated, setUserHasRated] = useState(false);

  useEffect(() => {
    const fetchCommentsAndRating = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5001/api/comments/${paperId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setComments(response.data.comments);
        setAverageRating(response.data.averageRating);
        setUserHasRated(response.data.userHasRated);
      } catch (error) {
        console.error('Error fetching comments and rating:', error);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/auth/current', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCurrentUserId(response.data.id);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCommentsAndRating();
    fetchCurrentUser();
  }, [paperId]);

  const handleAddComment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/api/comments',
        {
          content: newComment,
          paperId,
          rating: 0, // 不包含评分
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments([response.data.comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleRatePaper = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/api/comments/rate',
        {
          paperId,
          rating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments([response.data.comment, ...comments]); // 添加评论到列表
      setUserHasRated(true);
      setAverageRating(response.data.averageRating);
    } catch (error) {
      console.error('Error rating paper:', error);
    }
  };

  const handleRatingChange = (e) => {
    setRating(parseInt(e.target.value, 10));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="commentspage-comments-container">
      <h1>Comments</h1>
      <div className="commentspage-comments-grid">
        <div className="commentspage-add-comment-container">
          <div className="commentspage-average-rating">
            Average Rating: {averageRating !== null ? averageRating.toFixed(1) : 'No ratings yet'}
          </div>
          {!userHasRated && (
            <div className="commentspage-rating-container">
              <label htmlFor="rating">Rate this paper:</label>
              <select
                id="rating"
                value={rating}
                onChange={handleRatingChange}
                className="commentspage-rating-select"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
              <button onClick={handleRatePaper} className="commentspage-rate-button">
                Rate
              </button>
            </div>
          )}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="commentspage-textarea"
          />
          <button onClick={handleAddComment} className="commentspage-submit-button">
            Submit
          </button>
        </div>
        <div className="commentspage-divider"></div>
        <div className="commentspage-comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="commentspage-comment-item">
              <div className="commentspage-comment-content">
                <p>
                  <strong>user{comment.userId}:</strong> {comment.content}
                </p>
                <p className="commentspage-comment-date">{formatDate(comment.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Comments;
