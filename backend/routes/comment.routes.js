const express = require('express');
const { createComment, getComments } = require('../controllers/comment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

router.post('/', authMiddleware, createComment);
router.get('/:paperId', getComments);

// Add update and delete routes

module.exports = router;
