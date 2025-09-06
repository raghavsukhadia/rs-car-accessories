-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_config table
CREATE TABLE app_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_allowlist table
CREATE TABLE admin_allowlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enums
CREATE TYPE priority_level AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE call_status AS ENUM ('Active Calls', 'Pending', 'Followed up', 'Not Received', 'Completed');
CREATE TYPE service_status AS ENUM ('New Complaint', 'Under Inspection', 'Sent to Service Centre', 'Received', 'Completed');
CREATE TYPE requirement_status AS ENUM ('Pending', 'In Progress', 'Ordered', 'Procedure', 'Contacted Customer', 'Completed');

-- Create call_followups table
CREATE TABLE call_followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caller_name TEXT NOT NULL,
    caller_number TEXT NOT NULL,
    person_to_contact TEXT NOT NULL,
    operator TEXT NOT NULL,
    priority priority_level NOT NULL DEFAULT 'Medium',
    notes TEXT NOT NULL,
    status call_status NOT NULL DEFAULT 'Active Calls',
    assigned_to TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    response_time TEXT,
    call_outcome TEXT,
    time_to_respond TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_jobs table
CREATE TABLE service_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    modal_name TEXT NOT NULL,
    modal_registration_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_number TEXT NOT NULL,
    description TEXT NOT NULL,
    status service_status NOT NULL DEFAULT 'New Complaint',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_job_comments table
CREATE TABLE service_job_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_job_id UUID NOT NULL REFERENCES service_jobs(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create requirements table
CREATE TABLE requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_number TEXT NOT NULL,
    description TEXT NOT NULL,
    priority priority_level NOT NULL DEFAULT 'Medium',
    status requirement_status NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create requirement_comments table
CREATE TABLE requirement_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attachments table
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('service_job', 'service_job_comment', 'requirement', 'requirement_comment')),
    entity_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_call_followups_status ON call_followups(status);
CREATE INDEX idx_call_followups_priority ON call_followups(priority);
CREATE INDEX idx_service_jobs_status ON service_jobs(status);
CREATE INDEX idx_service_jobs_scheduled_at ON service_jobs(scheduled_at);
CREATE INDEX idx_requirements_status ON requirements(status);
CREATE INDEX idx_requirements_priority ON requirements(priority);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_app_config_updated_at BEFORE UPDATE ON app_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_call_followups_updated_at BEFORE UPDATE ON call_followups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_jobs_updated_at BEFORE UPDATE ON service_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_job_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for app_config
CREATE POLICY "Allow authenticated users to read app_config" ON app_config FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to modify app_config" ON app_config FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt() ->> 'email')
);

-- Create RLS policies for admin_allowlist
CREATE POLICY "Allow admins to manage admin_allowlist" ON admin_allowlist FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt() ->> 'email')
);

-- Create RLS policies for call_followups
CREATE POLICY "Allow authenticated users to manage call_followups" ON call_followups FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for service_jobs
CREATE POLICY "Allow authenticated users to manage service_jobs" ON service_jobs FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for service_job_comments
CREATE POLICY "Allow authenticated users to manage service_job_comments" ON service_job_comments FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for requirements
CREATE POLICY "Allow authenticated users to manage requirements" ON requirements FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for requirement_comments
CREATE POLICY "Allow authenticated users to manage requirement_comments" ON requirement_comments FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for attachments
CREATE POLICY "Allow authenticated users to manage attachments" ON attachments FOR ALL USING (auth.role() = 'authenticated');

-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false);

-- Create storage policy for attachments
CREATE POLICY "Allow authenticated users to upload attachments" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'attachments' AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to view attachments" ON storage.objects FOR SELECT USING (
    bucket_id = 'attachments' AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to update attachments" ON storage.objects FOR UPDATE USING (
    bucket_id = 'attachments' AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete attachments" ON storage.objects FOR DELETE USING (
    bucket_id = 'attachments' AND auth.role() = 'authenticated'
);

-- Insert initial app configuration
INSERT INTO app_config (key, value) VALUES 
('business_name', '"RS Car Accessories"'),
('business_hours', '{"saturday": "11am-7pm", "sunday": "closed", "monday": "11am-7pm", "tuesday": "11am-7pm", "wednesday": "11am-7pm", "thursday": "11am-7pm", "friday": "11am-7pm"}'),
('phone', '"081491 11110"'),
('address', '"510, Western Palace, opposite Park, Congress Nagar, Nagpur, Maharashtra 440012"');

-- Insert sample admin user (replace with actual admin email)
INSERT INTO admin_allowlist (email) VALUES ('admin@rscaraccessories.com');
