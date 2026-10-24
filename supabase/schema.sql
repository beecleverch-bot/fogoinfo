-- Schéma Fogoinfo pour Supabase.
-- À exécuter une fois dans Supabase > SQL Editor.

create extension if not exists pgcrypto;

-- Articles -------------------------------------------------------------------
create table if not exists public.articles (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  titre text not null,
  soustitre text,
  categorie text not null default 'Actualités',
  contenu text,
  image_url text,
  auteur text,
  date_publication timestamptz not null default now(),
  vues integer not null default 0,
  est_une boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists articles_date_idx on public.articles (date_publication desc);
create index if not exists articles_categorie_idx on public.articles (categorie);

-- Vidéos ---------------------------------------------------------------------
create table if not exists public.videos (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  titre text not null,
  description text,
  url_video text not null,
  miniature_url text,
  categorie text,
  duree text,
  vues integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Administrateurs (par e-mail) ----------------------------------------------
create table if not exists public.admins (
  email text primary key,
  invited_by text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Compteur de vues, appelable par les visiteurs anonymes.
create or replace function public.increment_vues(tbl text, row_id text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if tbl = 'articles' then
    update public.articles set vues = vues + 1 where id = row_id;
  elsif tbl = 'videos' then
    update public.videos set vues = vues + 1 where id = row_id;
  end if;
end;
$$;
grant execute on function public.increment_vues(text, text) to anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists articles_touch on public.articles;
create trigger articles_touch before update on public.articles
  for each row execute function public.touch_updated_at();
drop trigger if exists videos_touch on public.videos;
create trigger videos_touch before update on public.videos
  for each row execute function public.touch_updated_at();

-- Sécurité : lecture publique, écriture réservée aux admins ------------------
alter table public.articles enable row level security;
alter table public.videos enable row level security;
alter table public.admins enable row level security;

drop policy if exists "lecture publique" on public.articles;
create policy "lecture publique" on public.articles for select using (true);
drop policy if exists "ecriture admin" on public.articles;
create policy "ecriture admin" on public.articles for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "lecture publique" on public.videos;
create policy "lecture publique" on public.videos for select using (true);
drop policy if exists "ecriture admin" on public.videos;
create policy "ecriture admin" on public.videos for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins lisent" on public.admins;
create policy "admins lisent" on public.admins for select using (public.is_admin());
drop policy if exists "admins invitent" on public.admins;
create policy "admins invitent" on public.admins for insert with check (public.is_admin());
drop policy if exists "admins retirent" on public.admins;
create policy "admins retirent" on public.admins for delete
  using (public.is_admin() and lower(email) <> lower(auth.jwt() ->> 'email'));

-- Stockage des images ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media lecture" on storage.objects;
create policy "media lecture" on storage.objects for select
  using (bucket_id = 'media');
drop policy if exists "media upload admin" on storage.objects;
create policy "media upload admin" on storage.objects for insert
  with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media suppression admin" on storage.objects;
create policy "media suppression admin" on storage.objects for delete
  using (bucket_id = 'media' and public.is_admin());

-- Premiers administrateurs (comptes du site Base44) --------------------------
insert into public.admins (email) values
  ('beecleverch@gmail.com'),
  ('baldebinta17@gmail.com')
on conflict (email) do nothing;
