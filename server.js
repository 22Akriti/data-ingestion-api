const express = require('express');
const app = express();
const ingestRoute = require('./routes/ingest');
const statusRoute = require('./routes/status');

app.use(express.json());
app.use('/ingest', ingestRoute);
app.use('/status', statusRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Start background worker
const { startWorker } = require('./queueManager');
startWorker();
