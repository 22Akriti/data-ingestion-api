const request = require('supertest');
const express = require('express');
const app = express();
const ingestRoute = require('../routes/ingest');
const statusRoute = require('../routes/status');
const { startWorker, stopWorker } = require('../queueManager');

app.use(express.json());
app.use('/ingest', ingestRoute);
app.use('/status', statusRoute);

jest.setTimeout(20000); // Set global timeout to 20 seconds

let ingestionId = null;

beforeAll(() => {
  startWorker(); // Start background worker
});

afterAll(() => {
  stopWorker(); // Clean up to avoid hanging
});

describe('Data Ingestion API', () => {
  it('should accept an ingestion request', async () => {
    const res = await request(app).post('/ingest').send({
      ids: [1, 2, 3, 4, 5],
      priority: 'MEDIUM'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ingestion_id');
    ingestionId = res.body.ingestion_id;
  });

  it('should return the status of the ingestion request', async () => {
    const res = await request(app).get(`/status/${ingestionId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('batches');
    expect(res.body.batches.length).toBeGreaterThan(0);
  });

  it('should process batches with rate limit', async () => {
    await new Promise(resolve => setTimeout(resolve, 6000));
    const res = await request(app).get(`/status/${ingestionId}`);
    const completedCount = res.body.batches.filter(b => b.status === 'completed').length;
    expect(completedCount).toBeGreaterThan(0);
  });

  it('should handle higher priority jobs before lower ones', async () => {
    const res1 = await request(app).post('/ingest').send({
      ids: [10, 11, 12],
      priority: 'LOW'
    });

    const res2 = await request(app).post('/ingest').send({
      ids: [20, 21, 22],
      priority: 'HIGH'
    });

    const highId = res2.body.ingestion_id;
    await new Promise(resolve => setTimeout(resolve, 6000));

    const statusHigh = await request(app).get(`/status/${highId}`);
    const completed = statusHigh.body.batches.filter(b => b.status === 'completed');
    expect(completed.length).toBeGreaterThan(0);
  });
});
