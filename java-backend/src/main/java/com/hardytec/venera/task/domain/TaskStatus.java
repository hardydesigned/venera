package com.hardytec.venera.task.domain;

public enum TaskStatus {
    OPEN,
    IN_PROGRESS,
    DONE,
    CANCELLED;

    public static TaskStatus fromString(String value) {
        return TaskStatus.valueOf(value.toUpperCase());
    }
    
}
