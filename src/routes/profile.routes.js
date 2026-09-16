const router = require('express').Router();
const {
  getStudentProfile,
  updateStudentProfile,
  getEmployerProfile,
  updateEmployerProfile,
} = require('../controllers/profile.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Student routes
router.get('/student', authenticate, authorize('STUDENT'), getStudentProfile);
router.put(
  '/student',
  authenticate,
  authorize('STUDENT'),
  upload.single('resume'),
  updateStudentProfile
);

// Employer routes
router.get('/employer', authenticate, authorize('EMPLOYER'), getEmployerProfile);
router.put(
  '/employer',
  authenticate,
  authorize('EMPLOYER'),
  upload.single('logo'),
  updateEmployerProfile
);

module.exports = router;