const express = require('express');
const {
  createPaper,
  getMyLibrary,
  getAllPapers,
  searchPapers,
  createLibrary,
  getMyLibraries,
  getPapersByLibrary,
  deletePaper,
  deleteLibrary,
  getPaperPDF,
  updatePaperPDF,
  movePaper,
  getPaperContent,
  savePaperContent,
  sharePaper,
  getShareList,
  unsharePaper,
  getPaper,
  updatePaper
} = require('../controllers/paper.controller');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // 确保路径正确
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', authMiddleware, upload.single('pdf'), createPaper);
router.get('/mylibrary', authMiddleware, getMyLibrary);
router.get('/', getAllPapers);
router.get('/search', searchPapers);
router.post('/library', authMiddleware, createLibrary);
router.get('/mylibraries', authMiddleware, getMyLibraries);
router.get('/libraries/:libraryId/papers', authMiddleware, getPapersByLibrary);
router.delete('/:paperId', authMiddleware, deletePaper);
router.delete('/libraries/:libraryId', authMiddleware, deleteLibrary);
router.get('/pdf/:paperId', getPaperPDF);
router.put('/pdf/:paperId', authMiddleware, upload.single('pdf'), updatePaperPDF);
router.put('/:paperId/move', authMiddleware, movePaper);
router.get('/content/:paperId', authMiddleware, getPaperContent);
router.post('/save', authMiddleware, savePaperContent);
router.post('/share', authMiddleware, sharePaper);
router.get('/share-list/:paperId', authMiddleware, getShareList);
router.post('/unshare', authMiddleware, unsharePaper);
router.get('/:paperId', authMiddleware, getPaper);
router.put('/:paperId', authMiddleware, updatePaper);

module.exports = router;
