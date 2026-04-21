-- 007_storage_buckets.sql — provision Storage buckets from SQL.
-- Running this through the SQL editor is equivalent to creating the buckets
-- manually via Dashboard -> Storage -> New bucket, but keeps the setup
-- declarative and reproducible across environments.
--
-- UP

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
    (
        'complaint-photos',
        'complaint-photos',
        false,
        10 * 1024 * 1024,                         -- 10 MB
        array['image/jpeg', 'image/png', 'image/webp']
    ),
    (
        'ml-artifacts',
        'ml-artifacts',
        true,
        100 * 1024 * 1024,                        -- 100 MB
        null                                       -- any mime; YOLO weights + metrics.json
    )
on conflict (id) do update
    set public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

-- ml-artifacts is public read so Railway can wget the weights without auth.
create policy "ml-artifacts: public read"
    on storage.objects for select
    using (bucket_id = 'ml-artifacts');

-- Only authenticated admins push weights up. On the pilot this is fine
-- because no workflow writes to ml-artifacts from the browser.
create policy "ml-artifacts: admin write"
    on storage.objects for insert
    with check (
        bucket_id = 'ml-artifacts'
        and public.current_role() = 'admin'
    );

/*
-- DOWN
drop policy if exists "ml-artifacts: admin write"   on storage.objects;
drop policy if exists "ml-artifacts: public read"   on storage.objects;
delete from storage.buckets where id in ('complaint-photos', 'ml-artifacts');
*/
