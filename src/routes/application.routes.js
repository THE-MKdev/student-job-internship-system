const router = require('express').Router();
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} = require('../controllers/application.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Student routes
router.post('/jobs/:jobId/apply', authenticate, authorize('STUDENT'), applyToJob);
router.get('/my-applications', authenticate, authorize('STUDENT'), getMyApplications);

// Employer routes
router.get('/jobs/:jobId/applications', authenticate, authorize('EMPLOYER'), getJobApplications);
router.put('/:id/status', authenticate, authorize('EMPLOYER'), updateApplicationStatus);

module.exports = router;