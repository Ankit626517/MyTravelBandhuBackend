const Package = require('../models/Package');

// @desc    Get all packages (with filters & sorting)
// @route   GET /api/packages
// @access  Public
const getPackages = async (req, res) => {
  try {
    const { type, search, category, duration, state, country, maxPrice, sortBy } = req.query;
    let query = {};

    // 1. Filter by domestic / international
    if (type === 'domestic') {
      // Domestic packages have state but no country, or country is 'India'
      query.$or = [
        { country: { $exists: false } },
        { country: '' },
        { country: 'India' }
      ];
    } else if (type === 'international') {
      // International packages have country that is not empty/India
      query.country = { $exists: true, $ne: 'India', $gt: '' };
    }

    // 2. Text/Search filter
    if (search) {
      // Use text index search, or regex fallback
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }

    // 3. Category filter
    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // 4. State filter
    if (state && state !== 'All') {
      query.state = { $regex: new RegExp(`^${state}$`, 'i') };
    }

    // 5. Country filter
    if (country && country !== 'All') {
      query.country = { $regex: new RegExp(`^${country}$`, 'i') };
    }

    // 6. Max Price filter
    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }

    // 7. Duration filter (3-5 days, 6-8 days, 9+ days)
    if (duration && duration !== 'All') {
      if (duration === '3-5') {
        query.daysCount = { $gte: 3, $lte: 5 };
      } else if (duration === '6-8') {
        query.daysCount = { $gte: 6, $lte: 8 };
      } else if (duration === '9+') {
        query.daysCount = { $gte: 9 };
      }
    }

    // 8. Sorting
    let sortOptions = {};
    if (sortBy) {
      if (sortBy === 'price-low') {
        sortOptions.price = 1;
      } else if (sortBy === 'price-high') {
        sortOptions.price = -1;
      } else if (sortBy === 'rating') {
        sortOptions.rating = -1;
      }
    } else {
      sortOptions.createdAt = -1; // default sort by newest
    }

    const packages = await Package.find(query).sort(sortOptions);
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get package by ID
// @route   GET /api/packages/:id
// @access  Public
const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);

    if (pkg) {
      res.json(pkg);
    } else {
      res.status(404).json({ message: 'Package not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get popular destinations
// @route   GET /api/packages/popular
// @access  Public
const getPopularDestinations = async (req, res) => {
  try {
    // Return packages marked as popular, or just top 4 highest rated
    const popular = await Package.find({ isPopular: true }).limit(4);
    
    // If not enough popular packages marked, return top rated ones
    if (popular.length === 0) {
      const topRated = await Package.find({}).sort({ rating: -1 }).limit(4);
      return res.json(topRated);
    }
    
    res.json(popular);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a package
// @route   POST /api/packages
// @access  Private/Admin
const createPackage = async (req, res) => {
  try {
    const imageData = req.body;
    
    // Handle multi-part files from upload.fields
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        imageData.image = req.files.image[0].path;
      }
      if (req.files.images) {
        imageData.images = req.files.images.map(f => f.path);
      }
    }

    // Parse array/JSON fields if passed as strings (useful for form-data uploads)
    if (typeof imageData.highlights === 'string') imageData.highlights = JSON.parse(imageData.highlights);
    if (typeof imageData.inclusions === 'string') imageData.inclusions = JSON.parse(imageData.inclusions);
    if (typeof imageData.exclusions === 'string') imageData.exclusions = JSON.parse(imageData.exclusions);
    if (typeof imageData.itinerary === 'string') imageData.itinerary = JSON.parse(imageData.itinerary);
    if (typeof imageData.images === 'string') imageData.images = JSON.parse(imageData.images);

    const pkg = new Package(imageData);
    const createdPackage = await pkg.save();
    res.status(201).json(createdPackage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a package
// @route   PUT /api/packages/:id
// @access  Private/Admin
const updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);

    if (pkg) {
      const updateData = req.body;

      // Parse arrays if needed (do this first so we have the parsed array for merging)
      if (typeof updateData.highlights === 'string') updateData.highlights = JSON.parse(updateData.highlights);
      if (typeof updateData.inclusions === 'string') updateData.inclusions = JSON.parse(updateData.inclusions);
      if (typeof updateData.exclusions === 'string') updateData.exclusions = JSON.parse(updateData.exclusions);
      if (typeof updateData.itinerary === 'string') updateData.itinerary = JSON.parse(updateData.itinerary);
      if (typeof updateData.images === 'string') updateData.images = JSON.parse(updateData.images);

      // Handle multi-part files from upload.fields
      if (req.files) {
        if (req.files.image && req.files.image[0]) {
          updateData.image = req.files.image[0].path;
        }
        if (req.files.images) {
          const uploadedImages = req.files.images.map(f => f.path);
          const existingImages = Array.isArray(updateData.images) ? updateData.images : (pkg.images || []);
          updateData.images = [...existingImages, ...uploadedImages];
        }
      }

      Object.assign(pkg, updateData);
      const updatedPackage = await pkg.save();
      res.json(updatedPackage);
    } else {
      res.status(404).json({ message: 'Package not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a package
// @route   DELETE /api/packages/:id
// @access  Private/Admin
const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);

    if (pkg) {
      await pkg.deleteOne();
      res.json({ message: 'Package removed successfully' });
    } else {
      res.status(404).json({ message: 'Package not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPackages,
  getPackageById,
  getPopularDestinations,
  createPackage,
  updatePackage,
  deletePackage,
};
