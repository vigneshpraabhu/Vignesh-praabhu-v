import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// CORS Configuration
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

import path from 'path';

// Direct File Download Endpoints
app.get('/download-pdf', (req: Request, res: Response) => {
  const filePath = path.resolve(__dirname, '../../ResQLink_Project_Report_Final.pdf');
  res.download(filePath, 'ResQLink_Project_Report_Final.pdf');
});

app.get('/download-docx', (req: Request, res: Response) => {
  const filePath = path.resolve(__dirname, '../../ResQLink_Project_Report_Final.docx');
  res.download(filePath, 'ResQLink_Project_Report_Final.docx');
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'ResQLink Disaster Management Platform REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: process.env.MONGODB_URI ? 'Connected to MongoDB' : 'Dual-Mode Persistent Engine',
  });
});

// Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[API ERROR]', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[ResQLink Server] REST API listening on port ${PORT}`);
    console.log(`[Database] MongoDB URI target: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/resqlink'}`);
  });
}

export default app;
