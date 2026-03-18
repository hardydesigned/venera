package com.hardytec.venera.project.adapters.persistence;

import com.hardytec.venera.project.domain.ProjectWorkspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectWorkspaceRepository extends JpaRepository<ProjectWorkspace, UUID> {
    Optional<ProjectWorkspace> findByUserIdAndTeamIdIsNull(UUID userId);

    Optional<ProjectWorkspace> findByTeamId(UUID teamId);
}
