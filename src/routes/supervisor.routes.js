const router = require('express').Router();
const {
  getSupervisorProfile,
  updateSupervisorProfile,
  getMySupervisions,
  getSupervisionById,
  updateSupervisionNotes,
} = require('../controllers/supervisor.controller');
const {
  submitEvaluation,
  getMyEvaluations,
} = require('../controllers/evaluation.controller');
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

router.put('/applications/:applicationId/evaluate', submitEvaluation);
router.get('/evaluations', getMyEvaluations);

module.exports = router;