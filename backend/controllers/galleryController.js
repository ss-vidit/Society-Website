const GalleryPhoto = require('../models/GalleryPhoto');
const { getUploadedImageUrl } = require('../middleware/uploadMiddleware');

exports.getPublicGallery = async (_req, res) => {
  try {
    const photos = await GalleryPhoto.find()
      .select('eventName photo createdAt')
      .sort({ createdAt: -1, _id: -1 })
      .limit(200);

    res.status(200).json({ success: true, photos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not load gallery photos.' });
  }
};

exports.addGalleryPhotos = async (req, res) => {
  try {
    const eventName = String(req.body.eventName || '').trim();
    const files = req.files || [];

    if (!eventName) {
      return res.status(400).json({ success: false, message: 'Event name is required.' });
    }
    if (eventName.length > 120) {
      return res.status(400).json({ success: false, message: 'Event name must be 120 characters or fewer.' });
    }
    if (!files.length) {
      return res.status(400).json({ success: false, message: 'Choose at least one photo.' });
    }

    const photos = files
      .map((file) => ({
        eventName,
        photo: getUploadedImageUrl(file),
        createdBy: req.user._id
      }))
      .filter((photo) => photo.photo);

    if (!photos.length) {
      return res.status(400).json({ success: false, message: 'The selected photos could not be processed.' });
    }

    const createdPhotos = await GalleryPhoto.insertMany(photos);
    res.status(201).json({
      success: true,
      message: `Added ${createdPhotos.length} photo${createdPhotos.length === 1 ? '' : 's'} to the gallery.`,
      photos: createdPhotos
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not add gallery photos.' });
  }
};
