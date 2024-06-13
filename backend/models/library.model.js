const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Library = sequelize.define('Library', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  permission: {
    type: DataTypes.ENUM('Public', 'Private', 'Shared'),
    allowNull: false,
    defaultValue: 'Public'
  }
}, {
  timestamps: true
});

module.exports = Library;
