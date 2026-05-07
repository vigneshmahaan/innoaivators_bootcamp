-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create bootcamps table
CREATE TABLE bootcamps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Price in INR
    duration_days INTEGER,
    topics_covered TEXT,
    final_task TEXT,
    whatsapp_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    district VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create batches table
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bootcamp_id UUID REFERENCES bootcamps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    timing VARCHAR(255),
    meeting_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create registrations table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bootcamp_id UUID REFERENCES bootcamps(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    student_type VARCHAR(50), -- 'school' or 'college'
    institution_name VARCHAR(255),
    education_details VARCHAR(255), -- '12th Grade', 'B.Tech', etc.
    year_of_study VARCHAR(50),
    department VARCHAR(255), -- 'Computer Science', 'Mechanical', etc.
    field_of_study VARCHAR(255), -- 'Arts', 'Science', 'Engineering', etc.
    future_interests TEXT,
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'verified', 'failed'
    payment_proof_url TEXT,
    verified_email_sent BOOLEAN DEFAULT FALSE,
    failed_email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample bootcamp data
INSERT INTO bootcamps (id, title, description, price, duration_days, topics_covered, final_task) 
VALUES 
    (uuid_generate_v4(), 'Java Enterprise Architecture', 'Master Java Spring Boot, microservices, and enterprise design patterns. Ideal for backend developers.', 6999, 45, 'Java 17, Spring Boot 3, Microservices, Docker, Kafka', 'Build a distributed e-commerce backend system from scratch.'),
    (uuid_generate_v4(), 'Python for Machine Learning', 'Learn Python, Pandas, Scikit-Learn, and build real-world AI/ML models from scratch.', 5499, 30, 'Python, Pandas, NumPy, Scikit-Learn, TensorFlow Basics', 'Develop an end-to-end predictive model for housing prices.'),
    (uuid_generate_v4(), 'Data Science Bootcamp', 'Comprehensive data science curriculum covering statistics, deep learning, and big data tools.', 8999, 60, 'Statistics, SQL, Python, Deep Learning, Big Data', 'Analyze a large dataset and create a dashboard and a predictive model.'),
    (uuid_generate_v4(), 'Data Analyst Certification', 'Become a data analyst using SQL, Excel, Tableau, and Python data visualization libraries.', 4500, 30, 'SQL, Advanced Excel, Tableau, Python Data Viz', 'Create a comprehensive business intelligence dashboard for a retail company.');
