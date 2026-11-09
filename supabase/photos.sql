-- Fortschrittsfotos für die Aufbau App. Gleicher Schutz wie beim Sync: nur mit geheimem Schlüssel.
create table if not exists public.aufbau_photos (
  id text not null,          -- SHA-256 des Sync-Schlüssels
  day text not null,         -- YYYY-MM-DD
  img text not null,         -- JPEG als Data-URL, in der App verkleinert
  modified timestamptz not null default now(),
  primary key (id, day)
);
alter table public.aufbau_photos enable row level security;
revoke all on public.aufbau_photos from anon, authenticated;

create or replace function public.aufbau_photo_put(p_key text, p_day text, p_img text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if length(p_key) < 32 then raise exception 'Schlüssel zu kurz'; end if;
  if p_day !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Datum ungültig'; end if;
  if length(p_img) > 600000 then raise exception 'Foto zu groß'; end if;
  insert into public.aufbau_photos (id, day, img, modified)
  values (encode(extensions.digest(p_key, 'sha256'), 'hex'), p_day, p_img, now())
  on conflict (id, day) do update set img = excluded.img, modified = now();
end $$;

create or replace function public.aufbau_photo_days(p_key text)
returns setof text language sql security definer set search_path = public as $$
  select day from public.aufbau_photos
  where length(p_key) >= 32 and id = encode(extensions.digest(p_key, 'sha256'), 'hex')
  order by day;
$$;

create or replace function public.aufbau_photo_get(p_key text, p_day text)
returns text language sql security definer set search_path = public as $$
  select img from public.aufbau_photos
  where length(p_key) >= 32 and id = encode(extensions.digest(p_key, 'sha256'), 'hex') and day = p_day;
$$;

create or replace function public.aufbau_photo_del(p_key text, p_day text)
returns void language sql security definer set search_path = public as $$
  delete from public.aufbau_photos
  where length(p_key) >= 32 and id = encode(extensions.digest(p_key, 'sha256'), 'hex') and day = p_day;
$$;

revoke all on function public.aufbau_photo_put(text, text, text) from public;
revoke all on function public.aufbau_photo_days(text) from public;
revoke all on function public.aufbau_photo_get(text, text) from public;
revoke all on function public.aufbau_photo_del(text, text) from public;
grant execute on function public.aufbau_photo_put(text, text, text) to anon, authenticated;
grant execute on function public.aufbau_photo_days(text) to anon, authenticated;
grant execute on function public.aufbau_photo_get(text, text) to anon, authenticated;
grant execute on function public.aufbau_photo_del(text, text) to anon, authenticated;
