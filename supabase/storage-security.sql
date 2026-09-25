-- Run once in the Supabase SQL editor. PlacementX accesses Storage only from
-- the API with the service role and returns short-lived signed URLs.
update storage.buckets
set public = false
where id in ('student-documents', 'generated-reports');

alter table storage.objects enable row level security;

-- Browser/mobile clients do not need direct table privileges. The service_role
-- keeps its server-only bypass and must never be included in a client bundle.
revoke all on table storage.objects from anon, authenticated;
