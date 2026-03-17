-- Add payment_reference column to orders for crypto tx hashes and other payment refs
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_reference TEXT;

COMMENT ON COLUMN public.orders.payment_reference IS
  'Payment reference: crypto transaction hash, ChangeHero exchange ID, or other payment identifier';
