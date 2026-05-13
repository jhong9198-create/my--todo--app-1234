create table if not exists public.todos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  is_completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- 모든 사용자가 읽기/쓰기 가능하도록 RLS 정책 설정
alter table public.todos enable row level security;

create policy "Anyone can read todos"
  on public.todos for select
  using (true);

create policy "Anyone can insert todos"
  on public.todos for insert
  with check (true);

create policy "Anyone can update todos"
  on public.todos for update
  using (true);

create policy "Anyone can delete todos"
  on public.todos for delete
  using (true);
