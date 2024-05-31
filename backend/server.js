const express = require('express');
const sequelize = require('./config/database');
const User = require('./models/user.model');
const Paper = require('./models/paper.model');
const Library = require('./models/library.model');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const paperRoutes = require('./routes/paper.routes');
const libraryRoutes = require('./routes/library.routes');

// 路由配置
app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/libraries', libraryRoutes);

// 模型关联
Library.hasMany(Paper, { foreignKey: 'libraryId' });
Paper.belongsTo(Library, { foreignKey: 'libraryId' });

// 同步数据库
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error synchronizing the database:', error);
  }
};

// 服务器启动
app.listen(5001, () => {
  console.log('Server is running on port 5001');
  syncDatabase();
});
