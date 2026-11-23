-- Rode este arquivo no Supabase: SQL Editor > New query > Run

-- Caldeiras
create table if not exists public.boilers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  location text,
  model text,
  max_pressure numeric,            -- PMTA em kgf/cm²
  created_at timestamptz not null default now()
);

-- Leituras dos sensores
create table if not exists public.readings (
  id bigint generated always as identity primary key,
  boiler_id uuid not null references public.boilers(id) on delete cascade,
  pressure numeric not null,       -- kgf/cm²
  temperature numeric not null,    -- °C
  water_level numeric not null,    -- %
  status text not null default 'normal'
    check (status in ('normal', 'atencao', 'alarme', 'desligada')),
  created_at timestamptz not null default now()
);

create index if not exists readings_boiler_time_idx
  on public.readings (boiler_id, created_at desc);

-- Última leitura por caldeira
create or replace view public.latest_readings
with (security_invoker = true) as
select distinct on (boiler_id) *
from public.readings
order by boiler_id, created_at desc;

-- Segurança (RLS): cada usuário só vê as próprias caldeiras
alter table public.boilers enable row level security;
alter table public.readings enable row level security;

create policy "boilers: dono acessa" on public.boilers
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "readings: dono da caldeira acessa" on public.readings
  for all
  using (exists (
    select 1 from public.boilers b
    where b.id = readings.boiler_id and b.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.boilers b
    where b.id = readings.boiler_id and b.user_id = auth.uid()
  ));

-- Habilita atualização em tempo real da tabela de leituras
alter publication supabase_realtime add table public.readings;
