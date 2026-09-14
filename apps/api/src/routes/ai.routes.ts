import express from 'express';
import multer from 'multer';
import { generateEmbedding, semanticMatch, parseResume } from '../controllers/ai.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/embeddings/generate', verifyToken, isAdmin, generateEmbedding);
router.post('/embeddings/match', verifyToken, isAdmin, semanticMatch);

router.post('/resume/parse', verifyToken, upload.single('file'), parseResume);

export default router;
