-- 0011_owner_admin_trigger.sql — auto-admin voor eigenaar bij registratie

create or replace function public.grant_owner_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email = 'vastgoedgrunn@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_owner_admin on auth.users;
create trigger on_auth_user_owner_admin
  after insert on auth.users
  for each row execute function public.grant_owner_admin();
