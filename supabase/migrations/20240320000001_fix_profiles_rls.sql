-- Enable RLS
alter table profiles enable row level security;

-- Drop existing policies if any
drop policy if exists "Enable read access for authenticated users" on profiles;
drop policy if exists "Enable insert for authenticated users" on profiles;
drop policy if exists "Enable update for users based on id" on profiles;

-- Create policies
create policy "Enable read access for authenticated users"
on profiles for select
to authenticated
using (true);

create policy "Enable insert for authenticated users"
on profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Enable update for users based on id"
on profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on profiles to anon, authenticated; 