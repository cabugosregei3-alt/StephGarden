-- Storage Profiles Table (multiple profiles per user)
CREATE TABLE IF NOT EXISTS storage_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  provider TEXT DEFAULT 'storj' CHECK (provider IN ('storj', 's3')),
  endpoint TEXT,
  region TEXT DEFAULT 'us-east-1',
  access_key_id TEXT,
  secret_access_key TEXT,
  bucket TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE storage_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own storage profiles" ON storage_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_storage_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_storage_profiles_updated_at
  BEFORE UPDATE ON storage_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_profiles_updated_at();

-- Optional: Insert default profile
-- INSERT INTO storage_profiles (user_id, name, provider, endpoint, region, access_key_id, secret_access_key, bucket, is_active)
-- VALUES ('your-user-id', 'Default', 'storj', 'https://gateway.storjshare.io', 'us-east-1', 'your-key', 'your-secret', 'stefan', true);
