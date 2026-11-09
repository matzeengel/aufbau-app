-- Cloud-Sync für die Aufbau App. Einmal im Supabase SQL Editor ausführen.
-- Zugriff nur über die beiden Funktionen mit geheimem Sync-Schlüssel, direkter Tabellenzugriff ist gesperrt.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.aufbau_sync (
  id text primary key,                 -- SHA-256 des Sync-Schlüssels
  data jsonb not null,
  updated_at bigint not null default 0,
  modified timestamptz not null default now()
);
alter table public.aufbau_sync enable row level security;
revoke all on public.aufbau_sync from anon, authenticated;

create or replace function public.aufbau_get(p_key text)
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object('data', data, 'updatedAt', updated_at)
  from public.aufbau_sync
  where length(p_key) >= 32 and id = encode(extensions.digest(p_key, 'sha256'), 'hex');
$$;

create or replace function public.aufbau_put(p_key text, p_data jsonb, p_updated bigint)
returns bigint language plpgsql security definer set search_path = public as $$
declare
  hid text;
  cur bigint;
begin
  if length(p_key) < 32 then raise exception 'Schlüssel zu kurz'; end if;
  if pg_column_size(p_data) > 3000000 then raise exception 'Daten zu groß'; end if;
  hid := encode(extensions.digest(p_key, 'sha256'), 'hex');
  select updated_at into cur from public.aufbau_sync where id = hid;
  if cur is not null and cur > p_updated then
    return cur;  -- Server ist neuer, App lädt dann neu
  end if;
  insert into public.aufbau_sync (id, data, updated_at, modified)
  values (hid, p_data, p_updated, now())
  on conflict (id) do update set data = excluded.data, updated_at = excluded.updated_at, modified = now();
  return p_updated;
end $$;

revoke all on function public.aufbau_get(text) from public;
revoke all on function public.aufbau_put(text, jsonb, bigint) from public;
grant execute on function public.aufbau_get(text) to anon, authenticated;
grant execute on function public.aufbau_put(text, jsonb, bigint) to anon, authenticated;
