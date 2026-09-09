const router = require('express').Router();
const {
  register,
  login,
  logout,
  getCurrentUser,
} = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getCurrentUser);

module.exports = router;