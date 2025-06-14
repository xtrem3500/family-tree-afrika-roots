-- Enable RLS
alter table profiles enable row level security;

-- Drop existing policies if any
drop policy if exists "Enable read access for authenticated users" on profiles;
drop policy if exists "Enable insert for authenticated users" on profiles;
drop policy if exists "Enable update for users based on id" on profiles;
drop policy if exists "Profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;

-- Create policies
create policy "Profiles are viewable by everyone"
on profiles for select
using (true);

create policy "Users can insert their own profile"
on profiles for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on profiles to anon, authenticated; 