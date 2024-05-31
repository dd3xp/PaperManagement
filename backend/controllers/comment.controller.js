const Comment = require('../models/comment.model');
const Paper = require('../models/paper.model');
const User = require('../models/user.model');

exports.createComment = async (req, res) => {
  const { content, rating, paperId } = req.body;
  try {
    const comment = await Comment.create({
      content,
      rating,
      paperId,
      userId: req.userId,
    });
    res.status(201).json({ message: 'Comment created', comment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { paperId: req.params.paperId },
      include: [User],
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add update and delete handlers if needed
