const router = require('express').Router();
const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllJobs,
  toggleJobStatus,
  deleteJobAdmin,
  getAllApplications,
  assignSupervisor,
  getAllSupervisions,
  removeSupervision,
} = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Job management
router.get('/jobs', getAllJobs);
router.put('/jobs/:id/toggle', toggleJobStatus);
router.delete('/jobs/:id', deleteJobAdmin);

// Applications
router.get('/applications', getAllApplications);

// Supervisions
router.post('/supervisions', assignSupervisor);
router.get('/supervisions', getAllSupervisions);
router.delete('/supervisions/:id', removeSupervision);

module.exports = router;