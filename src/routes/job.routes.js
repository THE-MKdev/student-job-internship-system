const router = require('express').Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
} = require('../controllers/job.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected routes
router.post('/', authenticate, authorize('EMPLOYER'), createJob);
router.get('/employer/my-jobs', authenticate, authorize('EMPLOYER'), getMyJobs);
router.put('/:id', authenticate, authorize('EMPLOYER'), updateJob);
router.delete('/:id', authenticate, authorize('EMPLOYER'), deleteJob);

module.exports = router;