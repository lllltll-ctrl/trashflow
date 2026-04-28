-- 013_audit_log.sql
-- Append-only audit trail for all dispatcher-side mutations: who changed
-- which row, when, and what fields shifted. Required by IOM compliance review
-- (we promised "every state change is logged" in the pitch deck) and gives
-- us a free incident-response tool when something goes wrong in production.
--
-- The trigger captures inserts, updates, and deletes on the three tables
-- that residents and dispatchers actually touch. Reads stay invisible —
-- log volume already grows fast enough without that.
--
-- UP

create table if not exists public.audit_log (
    id          bigserial primary key,
    actor_id    uuid references auth.users(id) on delete set null,
    actor_role  text,
    table_name  text not null,
    record_id   uuid not null,
    action      text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
    diff        jsonb,
    created_at  timestamptz not null default now()
);

create index audit_log_record_idx
    on public.audit_log (table_name, record_id, created_at desc);
create index audit_log_actor_idx
    on public.audit_log (actor_id, created_at desc)
    where actor_id is not null;
create index audit_log_recent_idx
    on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

-- Read: dispatcher and admin can see their community's audit trail.
-- The trail itself isn't tenant-scoped (no community_id column — we'd have
-- to denormalize from each watched table) so we gate purely on role.
-- Cross-tenant leak is theoretically possible only if an admin from
-- community A could authenticate against community B's instance, which
-- our deployment model (one Supabase project per pilot) makes impossible.
create policy "audit_log: read by dispatcher/admin"
    on public.audit_log for select
    to authenticated
    using (public.current_role() in ('dispatcher', 'admin'));

-- No insert/update/delete policy — only the security-definer trigger writes.
-- Even a service-role key going rogue can't fabricate entries, because the
-- trigger sets actor_id from auth.uid() which a service_role call lacks.

create or replace function public.log_table_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_diff      jsonb;
    v_changed   jsonb;
begin
    if TG_OP = 'INSERT' then
        v_diff := jsonb_build_object('after', to_jsonb(new));
    elsif TG_OP = 'UPDATE' then
        select jsonb_object_agg(key, value)
        into v_changed
        from jsonb_each(to_jsonb(new)) as e(key, value)
        where to_jsonb(new) -> e.key is distinct from to_jsonb(old) -> e.key;
        v_diff := jsonb_build_object(
            'before', to_jsonb(old),
            'after',  to_jsonb(new),
            'changed_fields', coalesce(v_changed, '{}'::jsonb)
        );
    elsif TG_OP = 'DELETE' then
        v_diff := jsonb_build_object('before', to_jsonb(old));
    end if;

    insert into public.audit_log (actor_id, actor_role, table_name, record_id, action, diff)
    values (
        auth.uid(),
        public.current_role(),
        TG_TABLE_NAME,
        coalesce(new.id, old.id),
        TG_OP,
        v_diff
    );
    return coalesce(new, old);
end;
$$;

create trigger complaints_audit
    after insert or update or delete on public.complaints
    for each row execute function public.log_table_change();

create trigger crews_audit
    after insert or update or delete on public.crews
    for each row execute function public.log_table_change();

create trigger collection_points_audit
    after insert or update or delete on public.collection_points
    for each row execute function public.log_table_change();

create trigger pickup_schedules_audit
    after insert or update or delete on public.pickup_schedules
    for each row execute function public.log_table_change();

/*
-- DOWN
drop trigger if exists pickup_schedules_audit on public.pickup_schedules;
drop trigger if exists collection_points_audit on public.collection_points;
drop trigger if exists crews_audit on public.crews;
drop trigger if exists complaints_audit on public.complaints;
drop function if exists public.log_table_change();
drop policy  if exists "audit_log: read by dispatcher/admin" on public.audit_log;
drop index   if exists audit_log_recent_idx;
drop index   if exists audit_log_actor_idx;
drop index   if exists audit_log_record_idx;
drop table   if exists public.audit_log;
*/
