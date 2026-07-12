const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  getRelatedBlogs,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.get('/:id/related', getRelatedBlogs);

// Admin routes
router.post('/', protect, admin, upload.single('image'), createBlog);
router.put('/:id', protect, admin, upload.single('image'), updateBlog);
router.delete('/:id', protect, admin, deleteBlog);

module.exports = router;
