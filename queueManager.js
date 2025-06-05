const { saveStatus, updateBatchStatus } = require('./statusStore');

const queue = [];
const priorities = { HIGH: 1, MEDIUM: 2, LOW: 3 };

let shouldRun = true;

function addJob(ingestionId, ids, priority) {
  const timestamp = Date.now();
  const batches = [];
  for (let i = 0; i < ids.length; i += 3) {
    batches.push(ids.slice(i, i + 3));
  }

  saveStatus(ingestionId, batches);

  batches.forEach(batch => {
    queue.push({
      ingestionId,
      batch,
      createdAt: timestamp,
      priority
    });
  });

  // sort based on priority and timestamp
  queue.sort((a, b) => {
    if (priorities[a.priority] !== priorities[b.priority]) {
      return priorities[a.priority] - priorities[b.priority];
    }
    return a.createdAt - b.createdAt;
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startWorker() {
  shouldRun = true; // reset in case stop/start again
  while (shouldRun) {
    if (queue.length === 0) {
      await delay(1000);
      continue;
    }

    const job = queue.shift();
    const batchId = updateBatchStatus(job.ingestionId, job.batch, 'triggered');
    console.log(`Processing: ${job.batch}`);
    await delay(1000); // simulate external API call
    updateBatchStatus(job.ingestionId, job.batch, 'completed', batchId);
    await delay(4000); // rate limit: 5s total
  }
}

function stopWorker() {
  shouldRun = false;
}

module.exports = { addJob, startWorker, stopWorker };
