-- Enable RLS
alter table profiles enable row level security;

-- Drop existing policies if any
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;

-- Create policies
create policy "Users can insert their own profile"
on profiles for insert
with check (auth.uid() = id);

create policy "Users can view their own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on profiles to anon, authenticated; 