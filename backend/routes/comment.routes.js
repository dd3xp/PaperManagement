const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/comment.controller');
const authMiddleware = require('../middleware/auth');
const {
  createComment,
  getComments,
  ratePaper
} = require('../controllers/comment.controller');

// 添加评论路由
router.post('/', authMiddleware, createComment);

// 获取评论路由
router.get('/:paperId', authMiddleware, getComments);

// 评分路由
router.post('/rate', authMiddleware, ratePaper);

module.exports = router;
