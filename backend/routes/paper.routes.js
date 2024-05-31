const express = require('express');
const { getAllPapers, searchPapers, createPaper, getMyLibrary, createLibrary, getMyLibraries } = require('../controllers/paper.controller');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // 确保引用正确

router.get('/', getAllPapers);
router.get('/search', searchPapers);
router.get('/mylibrary', authMiddleware, getMyLibrary);
router.post('/', authMiddleware, createPaper);
router.post('/library', authMiddleware, createLibrary); // 新增
router.get('/mylibraries', authMiddleware, getMyLibraries); // 新增

module.exports = router;
