const { v4: uuidv4 } = require('uuid');

const dataStore = {};

function saveStatus(ingestionId, batches) {
  dataStore[ingestionId] = {
    ingestion_id: ingestionId,
    status: 'yet_to_start',
    batches: batches.map(batch => ({
      batch_id: uuidv4(),
      ids: batch,
      status: 'yet_to_start'
    }))
  };
}

function updateBatchStatus(ingestionId, ids, newStatus, batchId = null) {
  const record = dataStore[ingestionId];
  const batch = record.batches.find(b => JSON.stringify(b.ids) === JSON.stringify(ids));
  if (!batch) return null;
  batch.status = newStatus;
  const statuses = record.batches.map(b => b.status);
  if (statuses.every(s => s === 'completed')) {
    record.status = 'completed';
  } else if (statuses.some(s => s === 'triggered')) {
    record.status = 'triggered';
  } else {
    record.status = 'yet_to_start';
  }
  return batch.batch_id;
}

function getStatus(ingestionId) {
  return dataStore[ingestionId];
}

module.exports = { saveStatus, updateBatchStatus, getStatus };
