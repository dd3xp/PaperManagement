const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Library = require('./library.model');

const Paper = sequelize.define('Paper', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  keywords: {
    type: DataTypes.STRING,
    allowNull: true
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
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pdfPath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sharedUsers: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('sharedUsers');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('sharedUsers', JSON.stringify(value));
    }
  }
});

module.exports = Paper;
