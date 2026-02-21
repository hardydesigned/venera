package com.hardytec.venera.task.application;

import java.util.UUID;

public class TaskNotFoundException extends RuntimeException {

    public TaskNotFoundException(UUID taskId) {
        super("Task nicht gefunden: " + taskId);
    }
}
