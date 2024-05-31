const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('webapp', 'root', 'redd33211xyz', {
  host: 'localhost',
  dialect: 'mysql',
  dialectOptions: {
    authPlugins: {
      mysql_native_password: {
        authPlugin: 'mysql_native_password'
      }
    }
  }
});

module.exports = sequelize;
