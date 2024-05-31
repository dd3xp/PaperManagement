const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./user.model');
const Paper = require('./paper.model');

const Comment = sequelize.define('Comment', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  paperId: {
    type: DataTypes.INTEGER,
    references: {
      model: Paper,
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Comment;
