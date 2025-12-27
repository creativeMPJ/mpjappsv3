-- Add status_payment enum type
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE public.payment_status AS ENUM ('paid', 'unpaid');
    END IF;
END $$;

-- Add status_payment column to profiles with default 'unpaid'
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status_payment public.payment_status NOT NULL DEFAULT 'unpaid';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_status_payment ON public.profiles(status_payment);