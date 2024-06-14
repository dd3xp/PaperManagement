const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { jwtSecret } = require('../config/config');
const Paper = require('../models/paper.model');
const Library = require('../models/library.model');
const pdfParse = require('pdf-parse');
const { Document, Packer, Paragraph } = require('docx');
const puppeteer = require('puppeteer');
const Comment = require('../models/comment.model');

// 创建新论文
const createPaper = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const { title, author, keywords, permissions, libraryId } = req.body;
    const pdfFile = req.file; // 获取上传的PDF文件

    // 先创建论文记录，获取唯一ID
    const paper = await Paper.create({
      title,
      author,
      keywords,
      permissions,
      libraryId,
      ownerId: userId,
      pdfPath: null, // 初始化为null，稍后更新
      textContent: '', // 初始化为空字符串，稍后更新
      content: '', // 新增content字段
      sharedUsers: [] // 初始化sharedUsers为空数组
    });

    if (pdfFile) {
      const pdfFileName = `${paper.id}.pdf`;
      const saveDir = path.join(__dirname, '..', 'pdfs');
      const savePath = path.join(saveDir, pdfFileName);
      const pdfPath = path.join('pdfs', pdfFileName);

      // 确保保存目录存在
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
      }

      // 将上传的文件保存到指定路径并重命名为论文ID
      fs.renameSync(pdfFile.path, savePath);

      // 更新论文记录的pdfPath
      paper.pdfPath = pdfPath;
      await paper.save();

      // 将PDF转换为TXT文件
      const dataBuffer = fs.readFileSync(savePath);
      pdfParse(dataBuffer).then(async data => {
        const txtDir = path.join(__dirname, '..', 'txts');
        if (!fs.existsSync(txtDir)) {
          fs.mkdirSync(txtDir, { recursive: true });
        }
        const txtFileName = `${paper.id}.txt`;
        const txtPath = path.join(txtDir, txtFileName);

        fs.writeFileSync(txtPath, data.text);

        // 更新论文记录的textContent
        paper.textContent = data.text;
        paper.content = data.text;
        await paper.save();

        console.log('PDF has been converted and saved to TXT');
      }).catch(err => {
        console.error('Error converting PDF to TXT:', err);
      });
    } else {
      // 如果没有上传 PDF 文件，创建一个空白的 PDF 文件
      const pdfFileName = `${paper.id}.pdf`;
      const saveDir = path.join(__dirname, '..', 'pdfs');
      const savePath = path.join(saveDir, pdfFileName);
      const pdfPath = path.join('pdfs', pdfFileName);

      // 确保保存目录存在
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
      }

      // 创建一个空白的 PDF 文件
      const doc = new Document({
        creator: 'YourAppName',  // 添加creator属性
        title: 'Document Title',
        description: 'Document Description',
        sections: [
          {
            properties: {},
            children: []
          }
        ]
      });
      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(savePath, buffer);

      // 更新论文记录的pdfPath
      paper.pdfPath = pdfPath;
      await paper.save();
    }

    res.status(201).json(paper);
  } catch (error) {
    console.error('Error creating paper:', error);
    res.status(500).json({ error: 'An error occurred while creating the paper' });
  }
};

// 获取论文PDF
const getPaperPDF = async (req, res) => {
  try {
    const { paperId } = req.params;
    const paper = await Paper.findByPk(paperId);

    if (!paper || !paper.pdfPath) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    const pdfPath = path.join(__dirname, '..', paper.pdfPath);

    if (fs.existsSync(pdfPath)) {
      res.sendFile(pdfPath);
    } else {
      res.status(404).json({ error: 'PDF not found' });
    }
  } catch (error) {
    console.error('Error fetching paper PDF:', error);
    res.status(500).json({ error: 'An error occurred while fetching the paper PDF' });
  }
};

// 更新论文PDF
const updatePaperPDF = async (req, res) => {
  try {
    const { paperId } = req.body;
    const pdfFile = req.file; // 获取上传的PDF文件

    if (!pdfFile) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    const paper = await Paper.findByPk(paperId);

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const pdfFileName = `${paper.id}.pdf`;
    const saveDir = path.join(__dirname, '..', 'pdfs');
    const savePath = path.join(saveDir, pdfFileName);
    const newPdfPath = path.join('pdfs', pdfFileName);

    // 确保保存目录存在
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    // 将上传的文件保存到指定路径并重命名为论文ID
    fs.renameSync(pdfFile.path, savePath);

    // 更新数据库中的pdfPath
    paper.pdfPath = newPdfPath;
    await paper.save();

    // 将PDF转换为TXT文件
    const dataBuffer = fs.readFileSync(savePath);
    pdfParse(dataBuffer).then(async data => {
      const txtDir = path.join(__dirname, '..', 'txts');
      if (!fs.existsSync(txtDir)) {
        fs.mkdirSync(txtDir, { recursive: true });
      }
      const txtFileName = `${paper.id}.txt`;
      const txtPath = path.join(txtDir, txtFileName);

      fs.writeFileSync(txtPath, data.text);

      // 更新论文记录的textContent
      paper.textContent = data.text;
      paper.content = data.text;
      await paper.save();

      console.log('PDF has been converted and saved to TXT');
    }).catch(err => {
      console.error('Error converting PDF to TXT:', err);
    });

    res.status(200).json({ message: 'Paper updated successfully' });
  } catch (error) {
    console.error('Error updating paper:', error);
    res.status(500).json({ error: 'An error occurred while updating the paper' });
  }
};

// 移动论文
const movePaper = async (req, res) => {
  try {
    const { paperId } = req.params;
    const { libraryId } = req.body;

    const paper = await Paper.findByPk(paperId);

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const library = await Library.findByPk(libraryId);
    if (!library) {
      return res.status(404).json({ error: 'Library not found' });
    }

    if (library.permission === 'Private' && paper.ownerId !== req.userId && !paper.sharedUsers.includes(req.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    paper.libraryId = libraryId;
    await paper.save();

    res.status(200).json({ message: 'Paper moved successfully' });
  } catch (error) {
    console.error('Error moving paper:', error);
    res.status(500).json({ error: 'An error occurred while moving the paper' });
  }
};

// 获取用户自己的论文
const getMyLibrary = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const papers = await Paper.findAll({ where: { ownerId: userId } });
    res.status(200).json(papers);
  } catch (error) {
    console.error('Error fetching papers:', error);
    res.status(500).json({ error: 'An error occurred while fetching your papers' });
  }
};

// 获取所有论文
const getAllPapers = async (req, res) => {
  try {
    const papers = await Paper.findAll({
      include: {
        model: Library,
        where: {
          permission: {
            [Op.ne]: 'Private'
          }
        }
      }
    });
    res.status(200).json(papers);
  } catch (error) {
    console.error('Error fetching all papers:', error);
    res.status(500).json({ error: 'An error occurred while fetching all papers' });
  }
};

// 搜索论文
const searchPapers = async (req, res) => {
  const { search } = req.query;
  try {
    const papers = await Paper.findAll({
      include: {
        model: Library,
        where: {
          permission: {
            [Op.ne]: 'Private'
          }
        }
      },
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
const createLibrary = async (req, res) => {
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
const getMyLibraries = async (req, res) => {
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

// 删除论文
const deletePaper = async (req, res) => {
  try {
    const { paperId } = req.params;
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      console.log('Authorization token required');
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    console.log(`Attempting to delete paper with id: ${paperId} by user: ${userId}`);

    const paper = await Paper.findOne({ where: { id: paperId, ownerId: userId } });
    if (!paper) {
      console.log('Paper not found or access denied');
      return res.status(404).json({ error: 'Paper not found or access denied' });
    }

    const pdfPath = path.join(__dirname, '..', 'pdfs', `${paperId}.pdf`);
    const txtPath = path.join(__dirname, '..', 'txts', `${paperId}.txt`);
    const docxPath = path.join(__dirname, '..', 'docxs', `${paperId}.docx`);

    try {
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
      if (fs.existsSync(txtPath)) {
        fs.unlinkSync(txtPath);
      }
      if (fs.existsSync(docxPath)) {
        fs.unlinkSync(docxPath);
      }
    } catch (fileError) {
      console.error(`Error deleting files for paper with id: ${paperId}`, fileError);
      return res.status(500).json({ error: 'An error occurred while deleting files' });
    }

    try {
      await Comment.destroy({ where: { paperId: paperId } });
    } catch (commentError) {
      console.error(`Error deleting comments for paper with id: ${paperId}`, commentError);
      return res.status(500).json({ error: 'An error occurred while deleting comments' });
    }

    try {
      await paper.destroy();
    } catch (paperError) {
      console.error(`Error deleting paper with id: ${paperId}`, paperError);
      return res.status(500).json({ error: 'An error occurred while deleting the paper' });
    }

    console.log(`Paper with id: ${paperId} and associated files and comments deleted successfully`);
    res.status(200).json({ message: 'Paper and its comments deleted successfully' });
  } catch (error) {
    console.error('Error deleting paper:', error);
    res.status(500).json({ error: 'An error occurred while deleting the paper' });
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

    console.log(`Attempting to delete library with id: ${libraryId} by user: ${userId}`);

    const library = await Library.findOne({ where: { id: libraryId, userId } });
    if (!library) {
      return res.status(404).json({ error: 'Library not found or access denied' });
    }

    const papers = await Paper.findAll({ where: { libraryId } });

    for (const paper of papers) {
      const pdfPath = path.join(__dirname, '..', 'pdfs', `${paper.id}.pdf`);
      const txtPath = path.join(__dirname, '..', 'txts', `${paper.id}.txt`);
      const docxPath = path.join(__dirname, '..', 'docxs', `${paper.id}.docx`);

      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }

      if (fs.existsSync(txtPath)) {
        fs.unlinkSync(txtPath);
      }

      if (fs.existsSync(docxPath)) {
        fs.unlinkSync(docxPath);
      }
    }

    await Paper.destroy({ where: { libraryId } });
    await library.destroy();
    console.log(`Library with id: ${libraryId} and its papers and associated files deleted successfully`);
    res.status(200).json({ message: 'Library and its papers deleted successfully' });
  } catch (error) {
    console.error('Error deleting library:', error);
    res.status(500).json({ error: 'An error occurred while deleting the library' });
  }
};

// 获取论文内容
const getPaperContent = async (req, res) => {
  try {
    const { paperId } = req.params;
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    const paper = await Paper.findByPk(paperId);
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const isOwner = paper.ownerId === userId;
    const isSharedUser = Array.isArray(paper.sharedUsers) && paper.sharedUsers.includes(userId);

    if (!isOwner && !isSharedUser) {
      return res.status(403).json({ error: 'Access Denied' });
    }

    res.status(200).json({
      content: paper.content,
      isOwner,
      isSharedUser
    });
  } catch (error) {
    console.error('Error fetching paper content:', error);
    res.status(500).json({ error: 'An error occurred while fetching the paper content' });
  }
};

// 保存编辑内容到DOCX并转换为PDF
const savePaperContent = async (req, res) => {
  try {
    const { paperId, content } = req.body;
    const docxFileName = `${paperId}.docx`;
    const saveDir = path.join(__dirname, '..', 'docxs');
    const savePath = path.join(saveDir, docxFileName);

    const pdfFileName = `${paperId}.pdf`;
    const pdfSaveDir = path.join(__dirname, '..', 'pdfs');
    const pdfSavePath = path.join(pdfSaveDir, pdfFileName);

    // 确保保存目录存在
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    // 删除旧的DOCX文件（如果存在）
    if (fs.existsSync(savePath)) {
      fs.unlinkSync(savePath);
    }

    // 创建DOCX文件
    const doc = new Document({
      creator: 'YourAppName',  // 添加creator属性
      title: 'Document Title',
      description: 'Document Description',
      sections: [
        {
          properties: {},
          children: content.split('\n').map(line => new Paragraph(line))
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(savePath, buffer);

    // 等待10ms再转换为PDF
    setTimeout(async () => {
      if (!fs.existsSync(pdfSaveDir)) {
        fs.mkdirSync(pdfSaveDir, { recursive: true });
      }

      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 0
      });
      const page = await browser.newPage();

      await page.setContent(content);
      await page.pdf({ path: pdfSavePath, format: 'A4' });

      await browser.close();

      console.log('DOCX has been saved and converted to PDF');
    }, 10);

    // 更新数据库中的content字段
    const paper = await Paper.findByPk(paperId);
    paper.content = content;
    await paper.save();

    res.status(200).json({ message: 'Content saved to DOCX and converted to PDF successfully' });
  } catch (error) {
    console.error('Error saving content to DOCX and converting to PDF:', error);
    res.status(500).json({ error: 'An error occurred while saving content to DOCX and converting to PDF' });
  }
};

// 分享论文
const sharePaper = async (req, res) => {
  try {
    const { paperId, userId } = req.body;
    const paper = await Paper.findByPk(paperId);

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    let sharedUsers = Array.isArray(paper.sharedUsers) ? paper.sharedUsers : [];
    sharedUsers.push(parseInt(userId, 10)); // 确保 userId 作为整数存储

    paper.sharedUsers = sharedUsers;
    await paper.save();

    res.status(200).json({ message: 'Paper shared successfully' });
  } catch (error) {
    console.error('Error sharing paper:', error);
    res.status(500).json({ error: 'An error occurred while sharing the paper' });
  }
};

// 获取分享列表
const getShareList = async (req, res) => {
  try {
    const { paperId } = req.params;
    const paper = await Paper.findByPk(paperId);

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    res.status(200).json({ sharedUsers: paper.sharedUsers });
  } catch (error) {
    console.error('Error fetching share list:', error);
    res.status500().json({ error: 'An error occurred while fetching the share list' });
  }
};

// 取消分享论文
const unsharePaper = async (req, res) => {
  try {
    const { paperId, userId } = req.body;
    const paper = await Paper.findByPk(paperId);

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    let sharedUsers = paper.sharedUsers || [];
    sharedUsers = sharedUsers.filter(user => user !== userId);

    paper.sharedUsers = sharedUsers;
    await paper.save();

    res.status(200).json({ message: 'Paper unshared successfully' });
  } catch (error) {
    console.error('Error unsharing paper:', error);
    res.status(500).json({ error: 'An error occurred while unsharing the paper' });
  }
};

const getPaper = async (req, res) => {
  try {
    const paperId = req.params.paperId;
    const paper = await Paper.findByPk(paperId);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }
    res.status(200).json(paper);
  } catch (error) {
    console.error('Error fetching paper:', error);
    res.status(500).json({ message: 'Error fetching paper' });
  }
};

const updatePaper = async (req, res) => {
  try {
    const paperId = req.params.paperId;
    const { title, author, keywords } = req.body;
    const paper = await Paper.findByPk(paperId);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    paper.title = title || paper.title;
    paper.author = author || paper.author;
    paper.keywords = keywords || paper.keywords;

    await paper.save();
    res.status(200).json({ message: 'Paper updated successfully' });
  } catch (error) {
    console.error('Error updating paper:', error);
    res.status(500).json({ message: 'Error updating paper' });
  }
};

module.exports = {
  createPaper,
  getPaperPDF,
  updatePaperPDF,
  movePaper,
  getMyLibrary,
  getAllPapers,
  searchPapers,
  createLibrary,
  getMyLibraries,
  getPapersByLibrary,
  deletePaper,
  deleteLibrary,
  getPaperContent,
  savePaperContent,
  sharePaper,
  getShareList,
  unsharePaper,
  getPaper,
  updatePaper
};
