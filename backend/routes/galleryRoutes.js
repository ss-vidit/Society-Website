const express = require('express');
const router = express.Router();
const { getPublicGallery, addGalleryPhotos } = require('../controllers/galleryController');
const { protect, requireProfileSetup, boardOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimitMiddleware');

router.get('/public', getPublicGallery);
router.post('/', protect, requireProfileSetup, boardOnly, uploadLimiter, upload.array('photos', 10), addGalleryPhotos);

module.exports = router;
