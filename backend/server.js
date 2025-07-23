import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import connectDB from './config/db.js';
import payslipRoutes from './routes/payslip.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('connection error:', err));

// Add all routes FIRST (before static files)
app.use('/api', authRoutes);
app.use('/api', payslipRoutes);
app.use('/api/users', userRoutes);

// Only serve static files if the dist folder exists
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  console.log('Frontend dist folder found, serving static files...');
  app.use(express.static(frontendDistPath));
  
  // Handle React routing - use a more specific pattern instead of '*'
  app.get('/', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
  
  // Handle other frontend routes (but not API routes)
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  console.log('Frontend dist folder not found, skipping static file serving...');
  app.get('/', (req, res) => {
    res.json({ message: 'Backend server is running! Build frontend to serve static files.' });
  });
}

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on PORT: ${PORT}`);
  });
});