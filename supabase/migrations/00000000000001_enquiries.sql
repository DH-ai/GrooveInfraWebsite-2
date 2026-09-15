-- ============================================================================
-- Contact form submissions.
--
-- Enquiries were previously emailed and never stored, so a mail provider failure
-- lost the lead entirely. They are now persisted before the email is attempted.
-- ============================================================================

create table if not exists public.enquiries (
  id           bigserial primary key,
  name         text not null,
  email        text not null,
  phone        text,
  company      text,
  project_type text,
  location     text,
  message      text not null,
  status       text not null default 'new' check (status in ('new','contacted','closed')),
  email_sent   boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists enquiries_status_idx on public.enquiries (status);

-- RLS with no policies at all: this table holds personal data, so it must not be
-- readable or writable with the anon key that ships in the browser bundle. Both
-- the insert (contact route) and the reads (admin panel) go through the
-- service-role key on the server, which bypasses RLS.
alter table public.enquiries enable row level security;
