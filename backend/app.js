const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // 引入 cors 中间件
const authRoutes = require('./routes/auth.routes');
const libraryRoutes = require('./routes/library.routes');
const paperRoutes = require('./routes/paper.routes');
const commentRoutes = require('./routes/comment.routes');

const app = express();

app.use(cors()); // 使用 cors 中间件
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes); // 确保路径为 /api/auth
app.use('/api/libraries', libraryRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/comments', commentRoutes);

module.exports = app;
