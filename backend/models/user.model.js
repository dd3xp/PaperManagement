const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Library = require('./library.model');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

// 多对多关系
User.belongsToMany(Library, { through: 'Favorites', foreignKey: 'userId' });
Library.belongsToMany(User, { through: 'Favorites', foreignKey: 'libraryId' });

module.exports = User;
