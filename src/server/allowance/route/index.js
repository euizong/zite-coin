const express = require('express');
const router = express.Router();
const allowanceController = require('../controller');

router.get('/', allowanceController.getAllowance);

module.exports = router;
