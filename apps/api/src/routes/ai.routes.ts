import express from 'express';
import multer from 'multer';
import { generateEmbedding, semanticMatch, parseResume } from '../controllers/ai.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/embeddings/generate', generateEmbedding);
router.post('/embeddings/match', semanticMatch);

router.post('/resume/parse', upload.single('file'), parseResume);

export default router;
