const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/user.controller');

router.post('/', user_controller.create_user);

module.exports = router;