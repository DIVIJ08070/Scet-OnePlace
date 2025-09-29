const upload = require('../config/multer.config');
const cloudinary = require('../config/cloudinary.config');
const fs = require('fs');
const ApiError = require('../utils/response/ApiError.util');

const fileUploadMiddleware = (req, res, next) => {
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ])(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json(new ApiError(500, 'File upload failed', err));
    }

    try {
      const uploadedFiles = {};

      for (const fieldName in req.files) {
        const file = req.files[fieldName][0]; // each field has an array
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'scetOnePlace/',
          resource_type: 'raw' // or 'auto' if you want to support any type
        });

        // Store cloudinary details
        req.body[fieldName] = {
          cloudinaryUrl: result.secure_url,
          cloudinaryId: result.public_id,
          originalName: file.originalname
        };

        fs.unlinkSync(file.path); // remove from local disk
      }

      // Attach to req object
      req.uploadedFiles = uploadedFiles;

      next();
    } catch (uploadError) {
      console.error(uploadError);
      return res
        .status(500)
        .json(
          new ApiError(500, 'Cloudinary upload failed', uploadError.message)
        );
    }
  });
};

module.exports = fileUploadMiddleware;
