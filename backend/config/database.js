const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('webapp', 'root', 'redd33211xyz', {
  host: 'localhost',
  dialect: 'mysql',
  define: {
    timestamps: true
  }
});

module.exports = sequelize;
