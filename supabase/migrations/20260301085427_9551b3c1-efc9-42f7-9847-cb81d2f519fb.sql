-- Fix function_search_path_mutable: Set search_path on all functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Recreate handle_new_user with proper search_path (already has it but re-applying)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  INSERT INTO public.settings (user_id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.cash_balance (user_id, initial_amount, current_amount)
  VALUES (NEW.id, 0, 0);

  RETURN NEW;
END;
$function$;
