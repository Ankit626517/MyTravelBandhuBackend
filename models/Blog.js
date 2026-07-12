const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
  },
  summary: {
    type: String,
    required: [true, 'Blog summary is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required (e.g. Visa Guide, Travel Tips)'],
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
  },
  image: {
    type: String,
    required: [true, 'Blog image URL is required'],
  },
  readTime: {
    type: String,
    required: [true, 'Read time description is required (e.g. 5 mins read)'],
  },
}, { timestamps: true });

// Text index for searching title, summary, and content
blogSchema.index({ title: 'text', summary: 'text', content: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
