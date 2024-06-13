const express = require('express');
const {
  createLibrary,
  deleteLibrary,
  getMyLibraries,
  getPapersByLibrary,
  updateLibraryPermission,
  favoriteLibrary,
  unfavoriteLibrary, // 添加这一行
  getFavorites,
  getAllVisibleLibraries
} = require('../controllers/library.controller');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, createLibrary);
router.delete('/:libraryId', authMiddleware, deleteLibrary);
router.get('/mylibraries', authMiddleware, getMyLibraries);
router.get('/:libraryId/papers', authMiddleware, getPapersByLibrary);
router.get('/all', getAllVisibleLibraries);
router.put('/:libraryId', authMiddleware, updateLibraryPermission);
router.post('/:libraryId/favorite', authMiddleware, favoriteLibrary);
router.post('/:libraryId/unfavorite', authMiddleware, unfavoriteLibrary); // 添加这一行
router.get('/favorites', authMiddleware, getFavorites);

module.exports = router;
