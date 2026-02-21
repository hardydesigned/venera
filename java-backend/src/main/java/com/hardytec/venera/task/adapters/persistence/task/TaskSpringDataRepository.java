package com.hardytec.venera.task.adapters.persistence.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hardytec.venera.task.domain.TaskItem;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskSpringDataRepository extends JpaRepository<TaskItem, UUID> {
    List<TaskItem> findByUserIdAndProjectIdIsNull(UUID userId);
    List<TaskItem> findAllByUserIdAndProjectId(UUID userId, UUID projectId);
    Optional<TaskItem> findById(UUID id);
}
