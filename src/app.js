import express from 'express';
import { config } from './config.js';
import { handleWebhook } from './webhook/handler.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'wa-bot',
  });
});

/*
 * Evolution API Webhook
 */
app.post('/webhook', async (req, res) => {
  try {
    await handleWebhook(req.body);

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);

    res.sendStatus(500);
  }
});

app.listen(config.port, '0.0.0.0', () => {
  console.log(
    `WA Bot listening on port ${config.port}`
  );
});