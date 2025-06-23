const express = require('express');
const { createRelacion } = require('../controllers/relacionController');

const router = express.Router();

router.post('/', createRelacion);

module.exports = router;