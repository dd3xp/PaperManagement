const express = require('express');
const { createLibrary, getLibraries, getPapersInLibrary } = require('../controllers/library.controller');
const router = express.Router();

router.post('/', createLibrary);
router.get('/', getLibraries);
router.get('/:libraryId/papers', getPapersInLibrary);

module.exports = router;
