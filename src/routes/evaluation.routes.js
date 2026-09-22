const router = require('express').Router();
const { getEvaluation } = require('../controllers/evaluation.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Anyone logged in (student/employer/supervisor/admin) can fetch.
// Authorization is enforced inside the controller.
router.get('/applications/:applicationId', authenticate, getEvaluation);

module.exports = router;