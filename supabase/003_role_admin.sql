-- Rôle intermédiaire « admin ».
-- À exécuter une fois dans Supabase > SQL Editor, après 002_roles_pays.sql.
--
-- - super     : vous seul. Gère tout, y compris les admins et l'import.
-- - admin     : gère le contenu de tous les pays (articles, « à la une », vidéos)
--               et ajoute ou retire des rédacteurs. Ne peut ni créer, modifier
--               ou retirer un admin ou le super admin, ni modifier le site.
-- - redacteur : articles de son pays uniquement.

alter table public.admins drop constraint if exists admins_role_check;
alter table public.admins add constraint admins_role_check check (role in ('super', 'admin', 'redacteur'));

-- Super admin ou admin.
create or replace function public.is_gestionnaire()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) and role in ('super', 'admin')
  );
$$;

-- Indique si une adresse a accès à l'espace rédaction, pour ne pas
-- envoyer de lien de connexion (et consommer le quota d'e-mails) pour rien.
create or replace function public.email_autorise(adresse text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where lower(email) = lower(trim(adresse)));
$$;
grant execute on function public.email_autorise(text) to anon, authenticated;

-- Articles : tous les pays pour le super admin et les admins --------------------
drop policy if exists "articles ajout" on public.articles;
create policy "articles ajout" on public.articles for insert
  with check (public.is_gestionnaire() or (public.is_admin() and pays = public.admin_pays()));
drop policy if exists "articles modification" on public.articles;
create policy "articles modification" on public.articles for update
  using (public.is_gestionnaire() or (public.is_admin() and pays = public.admin_pays()))
  with check (public.is_gestionnaire() or (public.is_admin() and pays = public.admin_pays()));
drop policy if exists "articles suppression" on public.articles;
create policy "articles suppression" on public.articles for delete
  using (public.is_gestionnaire() or (public.is_admin() and pays = public.admin_pays()));

-- Seuls les rédacteurs sont bridés sur « à la une » et le compteur de vues.
create or replace function public.articles_garde()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.auteur_email is null then
    new.auteur_email := auth.jwt() ->> 'email';
  end if;
  if current_setting('fogoinfo.compteur', true) = 'on'
     or public.is_gestionnaire()
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

-- Vidéos ---------------------------------------------------------------------
drop policy if exists "ecriture super" on public.videos;
drop policy if exists "ecriture gestion" on public.videos;
create policy "ecriture gestion" on public.videos for all
  using (public.is_gestionnaire()) with check (public.is_gestionnaire());

-- Administrateurs : un admin ne touche qu'aux rédacteurs ----------------------
drop policy if exists "admins lecture" on public.admins;
create policy "admins lecture" on public.admins for select
  using (public.is_gestionnaire() or lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "super ajoute" on public.admins;
create policy "super ajoute" on public.admins for insert
  with check (public.is_super_admin() or (public.is_gestionnaire() and role = 'redacteur'));

drop policy if exists "super modifie" on public.admins;
create policy "super modifie" on public.admins for update
  using (public.is_super_admin() or (public.is_gestionnaire() and role = 'redacteur'))
  with check (public.is_super_admin() or (public.is_gestionnaire() and role = 'redacteur'));

drop policy if exists "super retire" on public.admins;
create policy "super retire" on public.admins for delete
  using (
    lower(email) <> lower(auth.jwt() ->> 'email')
    and (public.is_super_admin() or (public.is_gestionnaire() and role = 'redacteur'))
  );

-- Le super admin reste unique : personne d'autre ne peut devenir « super ».
create or replace function public.admins_garde()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.role = 'super' and lower(new.email) <> 'beecleverch@gmail.com' then
    raise exception 'Il ne peut y avoir qu''un seul super admin.';
  end if;
  return new;
end;
$$;
drop trigger if exists admins_garde on public.admins;
create trigger admins_garde before insert or update on public.admins
  for each row execute function public.admins_garde();

-- Images ---------------------------------------------------------------------
drop policy if exists "media suppression super" on storage.objects;
drop policy if exists "media suppression gestion" on storage.objects;
create policy "media suppression gestion" on storage.objects for delete
  using (bucket_id = 'media' and public.is_gestionnaire());
