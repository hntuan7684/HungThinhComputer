const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * Upload 1 ảnh hoặc không ảnh
 * @param {String} folder - folder Cloudinary
 */
const uploadSingleOptional = (folder) => [
    upload.single('image'),
    (req, res, next) => {
        if (!req.file) return next(); // Không có ảnh thì bỏ qua

        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) return res.status(500).json({ message: 'Upload failed', error });

                req.imageInfo = {
                    public_id: result.public_id,
                    url: result.secure_url
                };

                next();
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
    }
];


/**
 * Upload nhiều ảnh hoặc không ảnh
 * @param {String} folder - folder Cloudinary
 */
const uploadMultipleOptional = (folder) => [
    upload.array('images'),
    async (req, res, next) => {
        if (!req.files || req.files.length === 0) return next(); // Không có ảnh thì bỏ qua

        try {
            const uploadPromises = req.files.map(file =>
                new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder },
                        (err, result) => {
                            if (err) return reject(err);
                            resolve({
                                public_id: result.public_id,
                                url: result.secure_url
                            });
                        }
                    );
                    streamifier.createReadStream(file.buffer).pipe(stream);
                })
            );

            req.imageInfoList = await Promise.all(uploadPromises);
            next();
        } catch (error) {
            return res.status(500).json({ message: 'Upload failed', error });
        }
    }
];


module.exports = {
    uploadSingleOptional,
    uploadMultipleOptional
};
