const Blog = require('../models/Blog');

// @desc    Get all blogs (with search and category filters)
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    // Apply category filter
    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Apply search filter (checks title, summary, content)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query).sort({ date: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single blog by ID
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (blog) {
      res.json(blog);
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get related blogs (same category, excluding current blog, limit 3)
// @route   GET /api/blogs/:id/related
// @access  Public
const getRelatedBlogs = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Current blog not found' });
    }

    const related = await Blog.find({
      _id: { $ne: blog._id },
      category: blog.category
    }).limit(3);

    res.json(related);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = async (req, res) => {
  try {
    const blogData = req.body;
    if (req.file) {
      blogData.image = req.file.path;
    }

    const blog = new Blog(blogData);
    const createdBlog = await blog.save();
    res.status(201).json(createdBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (blog) {
      const updateData = req.body;
      if (req.file) {
        updateData.image = req.file.path;
      }

      Object.assign(blog, updateData);
      const updatedBlog = await blog.save();
      res.json(updatedBlog);
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (blog) {
      await blog.deleteOne();
      res.json({ message: 'Blog removed successfully' });
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  getRelatedBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
};
