const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const dirs = ['uploads/resumes', 'uploads/logos'];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      cb(null, 'uploads/resumes/');
    } else if (file.fieldname === 'logo') {
      cb(null, 'uploads/logos/');
    } else {
      cb(new Error('Unexpected field'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${req.session.user.id}-${uniqueSuffix}${ext}`);
  },
});

// File type filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Resume must be PDF or Word document'), false);
  } else if (file.fieldname === 'logo') {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Logo must be an image (JPEG, PNG, WebP)'), false);
  }
  cb(new Error('Unexpected field'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;