-- Fix feedback schema to match JPA entity definitions
-- This script updates the feedbacks table to match the column length specifications in the Feedback entity

-- Update the name column to match the JPA entity specification (length = 500)
ALTER TABLE feedbacks ALTER COLUMN name TYPE VARCHAR(500);

-- Verify the changes (uncomment to see table structure)
-- \d feedbacks;