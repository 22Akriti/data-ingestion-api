const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { addJob } = require('../queueManager');

router.post('/', (req, res) => {
  const ingestionId = uuidv4();
  const { ids, priority } = req.body;
  if (!Array.isArray(ids) || !priority) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  addJob(ingestionId, ids, priority);
  res.json({ ingestion_id: ingestionId });
});

module.exports = router;
