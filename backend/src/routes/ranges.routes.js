import { Router } from 'express';
import { RANGES } from '../data/ranges.js';

const router = Router();

// Reference ranges + units for the analysis entry form's live validation.
router.get('/', (req, res) => {
  res.json(RANGES);
});

export default router;
