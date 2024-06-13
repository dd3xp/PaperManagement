import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './EditPaper.css'; // 确保引入了CSS文件
import io from 'socket.io-client';

const EditPaper = ({ match }) => {
  const [content, setContent] = useState('');
  const [shareInput, setShareInput] = useState('');
  const [sharedUsers, setSharedUsers] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [canEdit, setCanEdit] = useState(false); // 新增变量判断是否可以编辑
  const { paperId } = match.params;
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchPaperContent = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5001/api/papers/content/${paperId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setIsOwner(response.data.isOwner);
        setCanEdit(response.data.isOwner || response.data.isSharedUser);

        if (response.data.isOwner || response.data.isSharedUser) {
          const formattedContent = formatTextContent(response.data.content);
          setContent(formattedContent);
        }
      } catch (error) {
        console.error('Error fetching paper content:', error);
      }
    };

    fetchPaperContent();
    fetchSharedUsers();

    socketRef.current = io('http://localhost:5001');
    socketRef.current.emit('joinPaper', paperId);

    socketRef.current.on('contentUpdate', (newContent) => {
      setContent(newContent);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [paperId]);

  const fetchSharedUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/papers/share-list/${paperId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSharedUsers(response.data.sharedUsers || []);
    } catch (error) {
      console.error('Error fetching share list:', error);
      alert('Failed to fetch share list.');
    }
  };

  const formatTextContent = (textContent) => {
    const lines = textContent.split('\n');
    const formattedLines = lines.map(line => `<p>${line}</p>`);
    return formattedLines.join('');
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/api/papers/save`, {
        paperId,
        content,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Content saved to DOCX and converted to PDF successfully!');
    } catch (error) {
      console.error('Error saving content to DOCX and converting to PDF:', error);
      alert('Failed to save content to DOCX and convert to PDF.');
    }
  };

  const handleShare = async () => {
    if (shareInput.length > 10) {
      alert('User ID cannot exceed 10 characters.');
      return;
    }
    if (sharedUsers.includes(shareInput)) {
      alert('User is already shared.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/api/papers/share`, {
        paperId,
        userId: shareInput,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSharedUsers([...sharedUsers, shareInput]);
      setShareInput('');
    } catch (error) {
      console.error('Error sharing paper:', error);
      alert('Failed to share paper.');
    }
  };

  const handleDeleteShareUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/api/papers/unshare`, {
        paperId,
        userId,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSharedUsers(sharedUsers.filter(user => user !== userId));
    } catch (error) {
      console.error('Error unsharing paper:', error);
      alert('Failed to unshare paper.');
    }
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    socketRef.current.emit('contentChange', { paperId, content: newContent });
  };

  if (!canEdit) {
    return <div className="edit-paper-refuse-access">Access Denied</div>; // 拒绝访问页面
  }

  return (
    <div className="edit-paper-container">
      <div className="edit-paper-title">Edit Paper</div> {/* 添加标题 */}
      {isOwner && (
        <div className="edit-paper-share-container">
          <div className="edit-paper-share-button-container">
            <button onClick={handleShare} className="edit-paper-share-button">Share</button>
            <input
              type="text"
              value={shareInput}
              onChange={(e) => setShareInput(e.target.value)}
              className="edit-paper-share-input"
              placeholder="Enter user id to share" /* 在输入框内添加提示语句 */
            />
          </div>
          <div className="edit-paper-share-list-title">Share List</div>
          <div className="edit-paper-shared-users">
            {sharedUsers.map((user, index) => (
              <div key={index} className="edit-paper-shared-user">
                user{user}
                <button
                  className="edit-paper-delete-share-user-button"
                  onClick={() => handleDeleteShareUser(user)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <ReactQuill value={content} onChange={handleContentChange} className="edit-paper-quill-editor" />
      {isOwner && <button onClick={handleSave} className="edit-paper-save-button">Save</button>}
    </div>
  );
};

export default EditPaper;
