-- Create family_relations table
CREATE TABLE IF NOT EXISTS family_relations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    related_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL CHECK (relation_type IN ('child', 'grandchild', 'nephew', 'grandnephew', 'spouse')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, related_to, relation_type)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS update_family_relations_updated_at ON family_relations;
DROP TRIGGER IF EXISTS on_new_relation ON family_relations;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS handle_new_relation();

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for family_relations
CREATE TRIGGER update_family_relations_updated_at
    BEFORE UPDATE ON family_relations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for new relation notification
CREATE OR REPLACE FUNCTION handle_new_relation()
RETURNS TRIGGER AS $$
DECLARE
    relation_message TEXT;
BEGIN
    -- Définir le message en fonction du type de relation
    relation_message := CASE NEW.relation_type
        WHEN 'child' THEN 'souhaite devenir votre enfant'
        WHEN 'grandchild' THEN 'souhaite devenir votre petit-enfant'
        WHEN 'nephew' THEN 'souhaite devenir votre neveu/nièce'
        WHEN 'grandnephew' THEN 'souhaite devenir votre petit-neveu/petite-nièce'
        WHEN 'spouse' THEN 'souhaite devenir votre conjoint'
    END;

    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
        NEW.related_to,
        'relation_request',
        'Nouvelle demande de relation',
        relation_message,
        jsonb_build_object(
            'relation_id', NEW.id,
            'user_id', NEW.user_id,
            'relation_type', NEW.relation_type
        )
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_new_relation
    AFTER INSERT ON family_relations
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_relation();

-- Enable RLS
ALTER TABLE family_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own relations" ON family_relations;
DROP POLICY IF EXISTS "Users can create relations" ON family_relations;
DROP POLICY IF EXISTS "Users can update their own relations" ON family_relations;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Create policies for family_relations
CREATE POLICY "Users can view their own relations"
    ON family_relations
    FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = related_to);

CREATE POLICY "Users can create relations"
    ON family_relations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own relations"
    ON family_relations
    FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = related_to);

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy for profiles table
CREATE POLICY "Enable insert for authenticated users only"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

CREATE POLICY "Enable read access for all users"
    ON profiles
    FOR SELECT
    USING (true);

CREATE POLICY "Enable update for users based on id"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id);
