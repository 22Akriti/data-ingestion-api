const express = require('express');
const router = express.Router();
const { getStatus } = require('../statusStore');

router.get('/:id', (req, res) => {
  const status = getStatus(req.params.id);
  if (!status) return res.status(404).json({ error: 'Not found' });
  res.json(status);
});

module.exports = router;
