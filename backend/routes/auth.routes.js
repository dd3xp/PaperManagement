const express = require('express');
const { register, login, updateUsername, updatePassword } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/update-username', authMiddleware, updateUsername); // 新增更新用户名路由
router.put('/update-password', authMiddleware, updatePassword); // 新增更新密码路由

module.exports = router;
