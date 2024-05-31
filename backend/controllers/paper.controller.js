const Paper = require('../models/paper.model');
const Library = require('../models/library.model'); // 新增
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');
const { Op } = require('sequelize');

// 创建新论文
exports.createPaper = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const { title, content, permissions, libraryId } = req.body;
    const paper = await Paper.create({ title, content, author: userId, permissions, libraryId });
    res.status(201).json(paper);
  } catch (error) {
    console.error('Error creating paper:', error);
    res.status(500).json({ error: 'An error occurred while creating the paper' });
  }
};

// 获取用户自己的论文
exports.getMyLibrary = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const papers = await Paper.findAll({ where: { author: userId } });
    res.status(200).json(papers);
  } catch (error) {
    console.error('Error fetching papers:', error);
    res.status(500).json({ error: 'An error occurred while fetching your papers' });
  }
};

// 获取所有论文
exports.getAllPapers = async (req, res) => {
  try {
    const papers = await Paper.findAll();
    res.status(200).json(papers);
  } catch (error) {
    console.error('Error fetching all papers:', error);
    res.status500().json({ error: 'An error occurred while fetching all papers' });
  }
};

// 搜索论文
exports.searchPapers = async (req, res) => {
  const { search } = req.query;
  try {
    const papers = await Paper.findAll({
      where: {
        title: {
          [Op.like]: `%${search}%`
        }
      }
    });
    res.status(200).json(papers);
  } catch (error) {
    console.error('Error searching papers:', error);
    res.status(500).json({ error: 'An error occurred while searching papers' });
  }
};

// 创建新文献库
exports.createLibrary = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const { name } = req.body;
    const library = await Library.create({ name, userId });
    res.status(201).json(library);
  } catch (error) {
    console.error('Error creating library:', error);
    res.status(500).json({ error: 'An error occurred while creating the library' });
  }
};

// 获取用户的文献库
exports.getMyLibraries = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const libraries = await Library.findAll({ where: { userId } });
    res.status(200).json(libraries);
  } catch (error) {
    console.error('Error fetching libraries:', error);
    res.status(500).json({ error: 'An error occurred while fetching your libraries' });
  }
};

// 获取特定文献库中的所有论文
exports.getPapersByLibrary = async (req, res) => {
  try {
    const { libraryId } = req.params;
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const papers = await Paper.findAll({ where: { author: userId, libraryId } });
    res.status(200).json(papers);
  } catch (error) {
    console.error('Error fetching papers by library:', error);
    res.status(500).json({ error: 'An error occurred while fetching papers by library' });
  }
};
