-- TechHelpDesk Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'technician', 'client');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high');

-- Table: user
CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table: client
CREATE TABLE client (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company VARCHAR NOT NULL,
    "contactEmail" VARCHAR NOT NULL,
    "userId" UUID UNIQUE,
    CONSTRAINT fk_client_user FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
);

-- Table: technician
CREATE TABLE technician (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    specialty VARCHAR NOT NULL,
    availability BOOLEAN NOT NULL DEFAULT true,
    "userId" UUID UNIQUE,
    CONSTRAINT fk_technician_user FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
);

-- Table: category
CREATE TABLE category (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description VARCHAR NOT NULL
);

-- Table: ticket
CREATE TABLE ticket (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    status ticket_status NOT NULL DEFAULT 'open',
    priority ticket_priority NOT NULL DEFAULT 'medium',
    "clientId" UUID,
    "technicianId" UUID,
    "categoryId" UUID,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_ticket_client FOREIGN KEY ("clientId") REFERENCES client(id) ON DELETE SET NULL,
    CONSTRAINT fk_ticket_technician FOREIGN KEY ("technicianId") REFERENCES technician(id) ON DELETE SET NULL,
    CONSTRAINT fk_ticket_category FOREIGN KEY ("categoryId") REFERENCES category(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_role ON "user"(role);
CREATE INDEX idx_ticket_status ON ticket(status);
CREATE INDEX idx_ticket_priority ON ticket(priority);
CREATE INDEX idx_ticket_client ON ticket("clientId");
CREATE INDEX idx_ticket_technician ON ticket("technicianId");
CREATE INDEX idx_ticket_category ON ticket("categoryId");

-- Trigger to auto-update 'updatedAt' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_updated_at BEFORE UPDATE ON ticket
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories
INSERT INTO category (name, description) VALUES
    ('Hardware', 'Issues related to physical equipment and devices'),
    ('Software', 'Software installation, configuration, and bugs'),
    ('Network', 'Network connectivity and configuration issues'),
    ('Security', 'Security concerns and access management'),
    ('Other', 'General inquiries and other requests');

-- Insert admin user (password: admin123 - hashed with bcrypt)
-- Note: You should change this password after first login
INSERT INTO "user" (name, email, password, role) VALUES
    ('Admin User', 'admin@techhelpdesk.com', '$2b$10$YourHashedPasswordHere', 'admin');

-- Optional: Insert sample technician
-- INSERT INTO "user" (name, email, password, role) VALUES
--     ('Tech Support', 'tech@techhelpdesk.com', '$2b$10$YourHashedPasswordHere', 'technician');
-- 
-- INSERT INTO technician (specialty, "userId") VALUES
--     ('Network & Hardware', (SELECT id FROM "user" WHERE email = 'tech@techhelpdesk.com'));

-- Optional: Insert sample client
-- INSERT INTO "user" (name, email, password, role) VALUES
--     ('Client User', 'client@example.com', '$2b$10$YourHashedPasswordHere', 'client');
-- 
-- INSERT INTO client (company, "contactEmail", "userId") VALUES
--     ('Example Corp', 'contact@example.com', (SELECT id FROM "user" WHERE email = 'client@example.com'));
