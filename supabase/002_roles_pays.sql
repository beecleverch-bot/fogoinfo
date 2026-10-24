-- Rôles et pays des administrateurs.
-- À exécuter une fois dans Supabase > SQL Editor, après schema.sql.
--
-- - super     : gère tout (articles de tous les pays, vidéos, administrateurs, import).
-- - redacteur : ajoute, modifie et supprime uniquement les articles de son pays.
--               Ne peut ni mettre un article « à la une », ni toucher aux vidéos
--               ni aux administrateurs.

-- Administrateurs ------------------------------------------------------------
alter table public.admins add column if not exists role text not null default 'redacteur';
alter table public.admins drop constraint if exists admins_role_check;
alter table public.admins add constraint admins_role_check check (role in ('super', 'redacteur'));
alter table public.admins add column if not exists pays text;

update public.admins set role = 'super' where lower(email) = 'beecleverch@gmail.com';
update public.admins set pays = 'Guinée' where role = 'redacteur' and pays is null;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) and role = 'super'
  );
$$;

create or replace function public.admin_pays()
returns text
language sql stable security definer set search_path = public
as $$
  select pays from public.admins
  where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  limit 1;
$$;

-- Articles -------------------------------------------------------------------
alter table public.articles add column if not exists pays text default 'Guinée';
alter table public.articles add column if not exists auteur_email text;
update public.articles set pays = 'Guinée' where pays is null;

drop policy if exists "ecriture admin" on public.articles;
drop policy if exists "articles ajout" on public.articles;
create policy "articles ajout" on public.articles for insert
  with check (public.is_super_admin() or (public.is_admin() and pays = public.admin_pays()));
drop policy if exists "articles modification" on public.articles;
create policy "articles modification" on public.articles for update
  using (public.is_super_admin() or (public.is_admin() and pays = public.admin_pays()))
  with check (public.is_super_admin() or (public.is_admin() and pays = public.admin_pays()));
drop policy if exists "articles suppression" on public.articles;
create policy "articles suppression" on public.articles for delete
  using (public.is_super_admin() or (public.is_admin() and pays = public.admin_pays()));

-- Un rédacteur ne peut pas mettre « à la une » ni changer le compteur de vues.
create or replace function public.articles_garde()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.auteur_email is null then
    new.auteur_email := auth.jwt() ->> 'email';
  end if;
  if current_setting('fogoinfo.compteur', true) = 'on'
     or public.is_super_admin()
     or coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.est_une := false;
    new.vues := 0;
  else
    new.est_une := old.est_une;
    new.vues := old.vues;
    new.auteur_email := old.auteur_email;
  end if;
  return new;
end;
$$;
drop trigger if exists articles_garde on public.articles;
create trigger articles_garde before insert or update on public.articles
  for each row execute function public.articles_garde();

-- Le compteur de vues des visiteurs passe outre la garde ci-dessus.
create or replace function public.increment_vues(tbl text, row_id text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform set_config('fogoinfo.compteur', 'on', true);
  if tbl = 'articles' then
    update public.articles set vues = vues + 1 where id = row_id;
  elsif tbl = 'videos' then
    update public.videos set vues = vues + 1 where id = row_id;
  end if;
end;
$$;

-- Vidéos : super admin uniquement -------------------------------------------
drop policy if exists "ecriture admin" on public.videos;
drop policy if exists "ecriture super" on public.videos;
create policy "ecriture super" on public.videos for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- Administrateurs : chacun voit sa fiche, le super admin gère tout ------------
drop policy if exists "admins lisent" on public.admins;
drop policy if exists "admins invitent" on public.admins;
drop policy if exists "admins retirent" on public.admins;
drop policy if exists "admins lecture" on public.admins;
create policy "admins lecture" on public.admins for select
  using (public.is_super_admin() or lower(email) = lower(auth.jwt() ->> 'email'));
drop policy if exists "super ajoute" on public.admins;
create policy "super ajoute" on public.admins for insert with check (public.is_super_admin());
drop policy if exists "super modifie" on public.admins;
create policy "super modifie" on public.admins for update
  using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists "super retire" on public.admins;
create policy "super retire" on public.admins for delete
  using (public.is_super_admin() and lower(email) <> lower(auth.jwt() ->> 'email'));

-- Images : tout admin peut en importer, seul le super admin en supprime ------
drop policy if exists "media suppression admin" on storage.objects;
drop policy if exists "media suppression super" on storage.objects;
create policy "media suppression super" on storage.objects for delete
  using (bucket_id = 'media' and public.is_super_admin());
