-- Add storage_profile_id to files table to link files to storage profiles
ALTER TABLE files ADD COLUMN IF NOT EXISTS storage_profile_id UUID REFERENCES storage_profiles(id) ON DELETE SET NULL;

-- Update the check constraint to include all common file types
ALTER TABLE files DROP CONSTRAINT IF EXISTS files_type_check;
ALTER TABLE files ADD CONSTRAINT files_type_check CHECK (type IN ('document', 'spreadsheet', 'upload', 'image', 'video', 'audio', 'docx', 'xlsx', 'pdf', 'pptx', 'archive', 'text'));

-- Make storage_profile_id optional but index it for performance
CREATE INDEX IF NOT EXISTS idx_files_storage_profile_id ON files(storage_profile_id);
