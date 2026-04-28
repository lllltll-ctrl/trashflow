-- Support messages table for resident → dispatcher feedback channel

set local search_path = public, extensions;

create table public.support_messages (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid references public.communities(id) not null,
  name         text not null,
  email        text not null,
  type         text not null default 'question'
               check (type in ('question', 'feedback', 'other')),
  message      text not null,
  status       text not null default 'new'
               check (status in ('new', 'read', 'replied')),
  reply        text,
  replied_at   timestamptz,
  created_at   timestamptz default now()
);

create index on public.support_messages (community_id, created_at desc);

alter table public.support_messages enable row level security;

-- Anyone can insert (residents submitting questions)
create policy "support_insert" on public.support_messages
  for insert to anon, authenticated
  with check (true);

-- Admin dashboard reads via anon key (demo mode — no service role needed)
create policy "support_read_anon" on public.support_messages
  for select to anon, authenticated using (true);

create policy "support_update_anon" on public.support_messages
  for update to anon, authenticated using (true);
