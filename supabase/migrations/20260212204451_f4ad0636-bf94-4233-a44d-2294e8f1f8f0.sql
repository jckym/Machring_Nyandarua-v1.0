-- Add unique constraint on phone to prevent duplicate farmers
-- Only apply to non-null, non-empty phone values
CREATE UNIQUE INDEX idx_farmers_unique_phone ON public.farmers (phone) WHERE phone IS NOT NULL AND phone != '';