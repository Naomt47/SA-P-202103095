const express = require('express');
const { createCI, getCI, updateCI, deleteCI, searchCIs } = require('../controllers/ciController');

const router = express.Router();

router.post('/', createCI);
router.get('/:id', getCI);
router.put('/:id', updateCI);
router.delete('/:id', deleteCI);
router.get('/', searchCIs);

module.exports = router;