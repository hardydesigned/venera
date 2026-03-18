package com.hardytec.venera.task.adapters.persistence.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hardytec.venera.task.domain.TaskItem;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskSpringDataRepository extends JpaRepository<TaskItem, UUID> {
    List<TaskItem> findByUserIdAndTeamIdIsNullAndProjectIdIsNull(UUID userId);
    List<TaskItem> findAllByUserIdAndTeamIdIsNullAndProjectId(UUID userId, UUID projectId);
    List<TaskItem> findByTeamIdAndProjectIdIsNull(UUID teamId);
    List<TaskItem> findAllByTeamIdAndProjectId(UUID teamId, UUID projectId);
    Optional<TaskItem> findById(UUID id);
}
