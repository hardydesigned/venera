ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS estimated_duration_minutes integer,
    ADD COLUMN IF NOT EXISTS actual_duration_minutes integer;

ALTER TABLE tasks
    ADD CONSTRAINT chk_tasks_estimated_duration_non_negative
        CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes >= 0),
    ADD CONSTRAINT chk_tasks_actual_duration_non_negative
        CHECK (actual_duration_minutes IS NULL OR actual_duration_minutes >= 0);
