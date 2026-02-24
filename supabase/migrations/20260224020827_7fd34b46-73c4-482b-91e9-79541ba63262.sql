
-- Fix permissive INSERT policies

-- Reservations: only the resident themselves can insert
DROP POLICY "Authenticated can insert reservations" ON public.reservations;
CREATE POLICY "Users can insert own reservations"
ON public.reservations FOR INSERT TO authenticated
WITH CHECK (resident_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Occurrences: only the reporter can insert
DROP POLICY "Authenticated can insert occurrences" ON public.occurrences;
CREATE POLICY "Users can insert own occurrences"
ON public.occurrences FOR INSERT TO authenticated
WITH CHECK (resident_id = auth.uid());

-- Occurrence events: sindico or event owner
DROP POLICY "Authenticated can insert events" ON public.occurrence_events;
CREATE POLICY "Sindico or related can insert events"
ON public.occurrence_events FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'sindico') OR
  occurrence_id IN (SELECT id FROM public.occurrences WHERE resident_id = auth.uid())
);
