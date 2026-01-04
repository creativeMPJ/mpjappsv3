-- Fix function search path for enforce_region_immutability
CREATE OR REPLACE FUNCTION public.enforce_region_immutability()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
    IF OLD.region_id IS NULL THEN
        IF NEW.city_id IS NOT NULL THEN
            SELECT region_id INTO NEW.region_id FROM public.cities WHERE id = NEW.city_id;
        END IF;
    ELSE
        IF OLD.region_id IS DISTINCT FROM NEW.region_id THEN
            RAISE EXCEPTION 'Security: Region Locked.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;