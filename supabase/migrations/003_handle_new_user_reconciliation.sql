-- Run after 001/002: update handle_new_user to run guest order reconciliation immediately on new user insert.
-- (reconcile_guest_orders must already exist)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  p_email TEXT;
BEGIN
  INSERT INTO public.users (id, email, role, profile_data)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    'customer',
    jsonb_build_object(
      'full_name', COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      'avatar_url', NEW.raw_user_meta_data->>'avatar_url'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  p_email := LOWER(TRIM(COALESCE(NEW.email, '')));
  IF p_email != '' THEN
    PERFORM public.reconcile_guest_orders(NEW.id, p_email);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
