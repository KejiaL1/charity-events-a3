import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import categoriesRouter from './routes/categories.js';
import eventsRouter from './routes/events.js';

const app = express();

app.use(cors());
app.use(express.json());

// 健康检查接口
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// 路由
app.use('/api/categories', categoriesRouter);
app.use('/api/events', eventsRouter);

// 启动
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
 
