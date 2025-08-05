const express = require('express');
const router = express.Router();
const userController = require('../controller');

router.get('/', userController.getUser);

module.exports = router;
