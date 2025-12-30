-- Add dokumen_bukti column to pesantren_claims
ALTER TABLE public.pesantren_claims
ADD COLUMN dokumen_bukti_url TEXT,
ADD COLUMN kecamatan TEXT,
ADD COLUMN nama_pengelola TEXT,
ADD COLUMN email_pengelola TEXT;

-- Create storage bucket for registration documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('registration-documents', 'registration-documents', false, 102400);

-- Storage policies for registration documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'registration-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'registration-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all registration documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'registration-documents'
  AND (
    has_role(auth.uid(), 'admin_pusat') 
    OR has_role(auth.uid(), 'admin_regional')
  )
);