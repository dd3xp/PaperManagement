const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Library = require('./library.model');

const Paper = sequelize.define('Paper', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  permissions: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'private'
  },
  libraryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Library,
      key: 'id'
    }
  }
});

module.exports = Paper;
