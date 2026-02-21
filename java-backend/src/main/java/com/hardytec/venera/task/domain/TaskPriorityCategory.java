package com.hardytec.venera.task.domain;

public enum TaskPriorityCategory {
    A,
    B,
    C;

    public static TaskPriorityCategory fromString(String value) {
        return TaskPriorityCategory.valueOf(value.toUpperCase());
    }
}
