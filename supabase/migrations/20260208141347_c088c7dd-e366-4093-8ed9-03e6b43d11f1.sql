
-- Storage RLS policies for payment-proofs bucket
-- Only admin_finance, admin_pusat, and file owners can view payment proofs
CREATE POLICY "Payment proofs select for admins and owners"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-proofs'
  AND (
    public.has_role(auth.uid(), 'admin_finance'::public.app_role)
    OR public.has_role(auth.uid(), 'admin_pusat'::public.app_role)
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- Users can upload their own payment proofs
CREATE POLICY "Payment proofs insert for owners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own payment proofs
CREATE POLICY "Payment proofs update for owners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS policies for registration-documents bucket
-- Owner + regional/pusat admins can view
CREATE POLICY "Registration docs select for admins and owners"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'registration-documents'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin_regional'::public.app_role)
    OR public.has_role(auth.uid(), 'admin_pusat'::public.app_role)
  )
);

-- Users can upload their own registration documents
CREATE POLICY "Registration docs insert for owners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'registration-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own registration documents
CREATE POLICY "Registration docs update for owners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'registration-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'registration-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
