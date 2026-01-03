-- Enable realtime for sales, visits, and trainings tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.visits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trainings;

-- Ensure REPLICA IDENTITY is set for proper realtime updates
ALTER TABLE public.sales REPLICA IDENTITY FULL;
ALTER TABLE public.visits REPLICA IDENTITY FULL;
ALTER TABLE public.trainings REPLICA IDENTITY FULL;