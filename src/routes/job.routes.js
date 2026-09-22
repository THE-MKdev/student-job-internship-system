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

router.get('/', getJobs);

router.get('/employer/my-jobs', authenticate, authorize('EMPLOYER'), getMyJobs);
router.post('/', authenticate, authorize('EMPLOYER'), createJob);
router.put('/:id', authenticate, authorize('EMPLOYER'), updateJob);
router.delete('/:id', authenticate, authorize('EMPLOYER'), deleteJob);

router.get('/:id', getJobById);

module.exports = router;