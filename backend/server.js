const express = require('express');
const sequelize = require('./config/db.config'); // 确保这里使用的是db.config
const User = require('./models/user.model');
const Paper = require('./models/paper.model');
const Library = require('./models/library.model');
const Comment = require('./models/comment.model'); // 引入评论模型
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const paperRoutes = require('./routes/paper.routes');
const libraryRoutes = require('./routes/library.routes');
const commentRoutes = require('./routes/comment.routes'); // 引入评论路由

app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/libraries', libraryRoutes);
app.use('/api/comments', commentRoutes); // 使用评论路由
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

Library.hasMany(Paper, { foreignKey: 'libraryId' });
Paper.belongsTo(Library, { foreignKey: 'libraryId' });
User.belongsToMany(Library, { through: 'Favorites', foreignKey: 'userId' });
Library.belongsToMany(User, { through: 'Favorites', foreignKey: 'libraryId' });
Paper.hasMany(Comment, { foreignKey: 'paperId' });
Comment.belongsTo(Paper, { foreignKey: 'paperId' });
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error synchronizing the database:', error);
  }
};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinPaper', (paperId) => {
    socket.join(paperId);
    console.log(`User joined paper ${paperId}`);
  });

  socket.on('contentChange', ({ paperId, content }) => {
    socket.to(paperId).emit('contentUpdate', content);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(5001, () => {
  console.log('Server is running on port 5001');
  syncDatabase();
});
