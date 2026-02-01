import { Router } from 'express';
import { requireAuth } from './middleware/auth.js';

const router = Router();

router.post('/mock', requireAuth, (req, res) => {
  const income = Number(req.body.income || 0);
  const deductions = Number(req.body.deductions || 0);
  const taxable = Math.max(0, income - deductions);
  let tax = 0;
  if (taxable <= 11000) tax = taxable * 0.10;
  else if (taxable <= 44725) tax = 1100 + (taxable - 11000) * 0.12;
  else tax = 5147 + (taxable - 44725) * 0.22;
  const effectiveRate = income > 0 ? (tax / income) : 0;
  res.json({ income, deductions, taxable, estimatedTax: Math.round(tax*100)/100, effectiveRate: Math.round(effectiveRate*1000)/10 });
});

export default router;
