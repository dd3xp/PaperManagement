const Library = require('../models/library.model');
const Paper = require('../models/paper.model');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');
const { Op } = require('sequelize');

// 创建新文献库
const createLibrary = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const { name, description } = req.body;
    const library = await Library.create({ name, description, userId, permission: 'Public' }); // 默认设置为Public
    res.status(201).json(library);
  } catch (error) {
    console.error('Error creating library:', error);
    res.status(500).json({ error: 'An error occurred while creating the library' });
  }
};

// 删除文献库
const deleteLibrary = async (req, res) => {
  try {
    const { libraryId } = req.params;
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const library = await Library.findOne({ where: { id: libraryId, userId } });
    if (!library) {
      return res.status(404).json({ error: 'Library not found or access denied' });
    }

    await Paper.destroy({ where: { libraryId } });
    await library.destroy();
    res.status(200).json({ message: 'Library deleted successfully' });
  } catch (error) {
    console.error('Error deleting library:', error);
    res.status(500).json({ error: 'An error occurred while deleting the library' });
  }
};

// 获取用户的文献库
const getMyLibraries = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const libraries = await Library.findAll({ where: { userId } });
    if (!libraries) {
      return res.status(404).json({ error: 'No libraries found' });
    }

    res.status(200).json(libraries);
  } catch (error) {
    console.error('Error fetching libraries:', error);
    res.status(500).json({ error: 'An error occurred while fetching your libraries' });
  }
};

// 获取特定文献库中的所有论文
const getPapersByLibrary = async (req, res) => {
  try {
    const { libraryId } = req.params;
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const papers = await Paper.findAll({ where: { libraryId } });
    res.status(200).json(papers);
  } catch (error) {
    console.error('Error fetching papers by library:', error);
    res.status(500).json({ error: 'An error occurred while fetching papers by library' });
  }
};

// 更新文献库权限
const updateLibraryPermission = async (req, res) => {
  try {
    const { libraryId } = req.params;
    const { permission } = req.body;
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const library = await Library.findOne({ where: { id: libraryId, userId } });
    if (!library) {
      return res.status(404).json({ error: 'Library not found or access denied' });
    }

    library.permission = permission;
    await library.save();
    res.status(200).json({ message: 'Library permission updated successfully' });
  } catch (error) {
    console.error('Error updating library permission:', error);
    res.status(500).json({ error: 'An error occurred while updating the library permission' });
  }
};

// 添加收藏文献库
const favoriteLibrary = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const { libraryId } = req.params;
    const user = await User.findByPk(userId);

    const library = await Library.findByPk(libraryId);
    if (!library) {
      return res.status(404).json({ message: 'Library not found' });
    }

    // 添加检查以确保用户无法收藏自己的文献库
    if (library.userId === userId) {
      return res.status(400).json({ message: 'You cannot favorite your own library' });
    }

    await user.addLibrary(library);

    res.status(200).json({ message: 'Library favorited successfully' });
  } catch (error) {
    console.error('Error favoriting library:', error);
    res.status(500).json({ error: 'An error occurred while favoriting the library' });
  }
};

// 获取收藏的文献库
const getFavorites = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const user = await User.findByPk(userId);
    const favoriteLibraries = await user.getLibraries();

    res.status(200).json(favoriteLibraries);
  } catch (error) {
    console.error('Error fetching favorite libraries:', error);
    res.status(500).json({ error: 'An error occurred while fetching favorite libraries' });
  }
};

const getAllVisibleLibraries = async (req, res) => {
  try {
    const libraries = await Library.findAll({
      where: {
        permission: {
          [Op.in]: ['Public', 'Shared']
        }
      }
    });
    res.status(200).json(libraries);
  } catch (error) {
    console.error('Error fetching libraries:', error);
    res.status(500).json({ error: 'An error occurred while fetching libraries' });
  }
};

// 取消收藏文献库
const unfavoriteLibrary = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const { libraryId } = req.params;
    const user = await User.findByPk(userId);

    const library = await Library.findByPk(libraryId);
    if (!library) {
      return res.status(404).json({ message: 'Library not found' });
    }

    await user.removeLibrary(library);

    res.status(200).json({ message: 'Library unfavorited successfully' });
  } catch (error) {
    console.error('Error unfavoriting library:', error);
    res.status(500).json({ error: 'An error occurred while unfavoriting the library' });
  }
};

module.exports = {
  createLibrary,
  deleteLibrary,
  getMyLibraries,
  getPapersByLibrary,
  updateLibraryPermission,
  favoriteLibrary,
  unfavoriteLibrary,  // 确保导出
  getFavorites,
  getAllVisibleLibraries
};
