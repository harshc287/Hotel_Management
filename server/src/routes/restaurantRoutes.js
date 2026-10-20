
import { Router } from 'express';
import Restaurant from '../models/Restaurant.js';
const router = Router();
router.get('/public/:slug', async (req, res) => {
  const restaurant = await Restaurant.findOne({ slug: req.params.slug, active: true }).select('name slug address currency taxRate');
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
  res.json({ restaurant });
});
export default router;
