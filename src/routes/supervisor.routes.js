const router = require('express').Router();
const {
  getSupervisorProfile,
  updateSupervisorProfile,
  getMySupervisions,
  getSupervisionById,
  updateSupervisionNotes,
} = require('../controllers/supervisor.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// All supervisor routes require authentication and SUPERVISOR role
router.use(authenticate, authorize('SUPERVISOR'));

// Profile
router.get('/profile', getSupervisorProfile);
router.put('/profile', updateSupervisorProfile);

// Supervisions
router.get('/supervisions', getMySupervisions);
router.get('/supervisions/:id', getSupervisionById);
router.put('/supervisions/:id/notes', updateSupervisionNotes);

module.exports = router;