import express from 'express';
import { config } from './config.js';
import { handleWebhook } from './webhook/handler.js';
import { handleEvolutionBot } from './webhook/evolution-bot.js';

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
app.post('/evolution-bot', async (req, res) => {
  try {
    console.log('Evolution Bot request:', {
      query: req.body?.query,
      messageId:
        req.body?.key?.id ||
        req.body?.messageId ||
        req.body?.id,
      remoteJid:
        req.body?.key?.remoteJid ||
        req.body?.remoteJid,
    });

    const result = await handleEvolutionBot(req.body);

    res.status(200).json({
      message: result,
    });
  } catch (error) {
    console.error('Evolution Bot error:', error);

    res.status(500).json({
      message: '❌ Terjadi kesalahan pada WA-Bot.',
    });
  }
});

/*
 * Evolution Bot integration endpoint
 *
 * Evolution API akan POST message ke endpoint ini.
 */
app.post('/evolution-bot', async (req, res) => {
  try {
    const result = await handleEvolutionBot(req.body);

    res.status(200).json({
      message: result,
    });
  } catch (error) {
    console.error('Evolution Bot error:', error);

    res.status(500).json({
      message: '❌ Terjadi kesalahan pada WA-Bot.',
    });
  }
});

app.listen(config.port, '0.0.0.0', () => {
  console.log(`WA Bot listening on port ${config.port}`);
});