package com.hardytec.venera.task.adapters.persistence.task;

import com.hardytec.venera.task.domain.TaskItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskSpringDataRepository extends JpaRepository<TaskItem, UUID> {
    List<TaskItem> findByUserIdAndTeamIdIsNull(UUID userId);
    List<TaskItem> findByTeamId(UUID teamId);
    Optional<TaskItem> findById(UUID id);
}
