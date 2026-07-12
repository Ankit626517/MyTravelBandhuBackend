const express = require('express');
const router = express.Router();
const { 
  getPackages, 
  getPackageById, 
  getPopularDestinations, 
  createPackage, 
  updatePackage, 
  deletePackage 
} = require('../controllers/packageController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Public endpoints
router.get('/', getPackages);
router.get('/popular', getPopularDestinations);
router.get('/:id', getPackageById);

// Protected Admin endpoints
router.post('/', protect, admin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 5 }]), createPackage);
router.put('/:id', protect, admin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 5 }]), updatePackage);
router.delete('/:id', protect, admin, deletePackage);

module.exports = router;
