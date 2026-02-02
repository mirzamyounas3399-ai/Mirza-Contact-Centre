import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, audio, and documents
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// File upload endpoint
router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileSize = (req.file.size / 1024).toFixed(2) + ' KB';
    
    if (req.file.size > 1024 * 1024) {
      const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
      res.json({
        url: fileUrl,
        fileName: req.file.originalname,
        fileSize: fileSizeMB,
        mimeType: req.file.mimetype
      });
    } else {
      res.json({
        url: fileUrl,
        fileName: req.file.originalname,
        fileSize,
        mimeType: req.file.mimetype
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

export default router;
