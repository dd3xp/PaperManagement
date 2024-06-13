const Comment = require('../models/comment.model');
const sequelize = require('sequelize');
const User = require('../models/user.model');

exports.createComment = async (req, res) => {
  const { content, paperId } = req.body;
  console.log('Received request to create comment:', req.body);
  try {
    const comment = await Comment.create({
      content,
      paperId,
      userId: req.userId,
      rating: 0, // 评论不包含评分
    });
    console.log('Comment created:', comment);

    res.status(201).json({ message: 'Comment created', comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getComments = async (req, res) => {
  console.log('Received request to get comments for paperId:', req.params.paperId);
  try {
    const comments = await Comment.findAll({
      where: { paperId: req.params.paperId },
      include: [User],
      order: [['createdAt', 'DESC']]
    });
    console.log('Comments retrieved:', comments);

    const averageRating = await Comment.findOne({
      where: { paperId: req.params.paperId, rating: { [sequelize.Op.gt]: 0 } }, // 仅计算评分大于0的评论
      attributes: [[sequelize.fn('avg', sequelize.col('rating')), 'avgRating']],
      raw: true,
    });
    console.log('Average rating retrieved:', averageRating);

    const userRating = await Comment.findOne({
      where: { paperId: req.params.paperId, userId: req.userId, rating: { [sequelize.Op.gt]: 0 } },
      attributes: ['rating'],
    });
    console.log('User rating retrieved:', userRating);

    res.status(200).json({
      comments,
      averageRating: parseFloat(averageRating.avgRating) || 0,
      userHasRated: userRating !== null && userRating.rating > 0
    });
  } catch (error) {
    console.error('Error retrieving comments:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.ratePaper = async (req, res) => {
  const { paperId, rating } = req.body;
  console.log('Received request to rate paper:', req.body);
  try {
    // 创建带评分的评论
    const userComment = await Comment.create({
      content: `User rated this paper ${rating} out of 5`,
      paperId,
      userId: req.userId,
      rating: rating,
    });
    console.log('New rating comment created:', userComment);

    // 重新计算平均评分
    const averageRating = await Comment.findOne({
      where: { paperId, rating: { [sequelize.Op.gt]: 0 } }, // 仅计算评分大于0的评论
      attributes: [[sequelize.fn('avg', sequelize.col('rating')), 'avgRating']],
      raw: true,
    });
    console.log('Average rating recalculated:', averageRating);

    res.status(200).json({
      message: 'Paper rated',
      comment: userComment,
      averageRating: parseFloat(averageRating.avgRating) || 0,
    });
  } catch (error) {
    console.error('Error rating paper:', error);
    res.status(400).json({ error: error.message });
  }
};
