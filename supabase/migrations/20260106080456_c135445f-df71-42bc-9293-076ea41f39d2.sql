-- Add trainer text field to trainings table for manual trainer name entry
ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS trainer TEXT;

-- Update status column default to 'completed' since all trainings are historical
ALTER TABLE public.trainings ALTER COLUMN status SET DEFAULT 'completed';