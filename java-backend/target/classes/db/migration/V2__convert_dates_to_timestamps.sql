-- Convert date columns to timestamp for tasks table
ALTER TABLE tasks
    ALTER COLUMN start_date TYPE timestamp USING start_date::timestamp,
    ALTER COLUMN due_date TYPE timestamp USING due_date::timestamp;

-- Convert date columns to timestamp for subtasks table
ALTER TABLE subtasks
    ALTER COLUMN start_date TYPE timestamp USING start_date::timestamp,
    ALTER COLUMN due_date TYPE timestamp USING due_date::timestamp;
