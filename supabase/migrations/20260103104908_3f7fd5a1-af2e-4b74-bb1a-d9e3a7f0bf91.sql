-- Insert bank settings into system_settings table
-- (The table already exists, we just add new key-value pairs)

-- Bank name setting
INSERT INTO public.system_settings (key, value, description)
VALUES ('bank_name', '"Bank Syariah Indonesia (BSI)"', 'Nama bank untuk pembayaran')
ON CONFLICT (key) DO NOTHING;

-- Bank account number setting
INSERT INTO public.system_settings (key, value, description)
VALUES ('bank_account_number', '"7171234567890"', 'Nomor rekening bank untuk pembayaran')
ON CONFLICT (key) DO NOTHING;

-- Bank account holder name setting
INSERT INTO public.system_settings (key, value, description)
VALUES ('bank_account_name', '"MEDIA PONDOK JAWA TIMUR"', 'Nama pemilik rekening bank')
ON CONFLICT (key) DO NOTHING;

-- Add unique constraint on key column if not exists (to prevent duplicates)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'system_settings_key_unique' 
        AND conrelid = 'public.system_settings'::regclass
    ) THEN
        ALTER TABLE public.system_settings ADD CONSTRAINT system_settings_key_unique UNIQUE (key);
    END IF;
EXCEPTION WHEN others THEN
    NULL; -- Ignore if already exists
END $$;