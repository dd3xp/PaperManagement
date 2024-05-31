const Library = require('../models/library.model');
const Paper = require('../models/paper.model');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

exports.createLibrary = async (req, res) => {
  const { name } = req.body;
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const library = await Library.create({ name, userId });
    res.status(201).json({ message: 'Library created successfully', library });
  } catch (error) {
    console.error('Error creating library:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getLibraries = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const libraries = await Library.findAll({ where: { userId } });
    res.status(200).json(libraries);
  } catch (error) {
    console.error('Error fetching libraries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPapersInLibrary = async (req, res) => {
  const { libraryId } = req.params;

  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const library = await Library.findOne({ where: { id: libraryId, userId } });

    if (!library) {
      return res.status(404).json({ message: 'Library not found or access denied' });
    }

    const papers = await Paper.findAll({ where: { libraryId } });
    res.status(200).json(papers);
  } catch (error) {
    console.error('Error fetching papers in library:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
