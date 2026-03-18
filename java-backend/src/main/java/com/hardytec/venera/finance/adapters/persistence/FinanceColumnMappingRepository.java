package com.hardytec.venera.finance.adapters.persistence;

import com.hardytec.venera.finance.domain.FinanceColumnMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FinanceColumnMappingRepository extends JpaRepository<FinanceColumnMapping, UUID> {

    List<FinanceColumnMapping> findByUserIdAndTeamIdIsNullOrderByProviderKeyAsc(UUID userId);

    List<FinanceColumnMapping> findByTeamIdOrderByProviderKeyAsc(UUID teamId);

    Optional<FinanceColumnMapping> findByUserIdAndTeamIdIsNullAndProviderKeyIgnoreCase(UUID userId, String providerKey);

    Optional<FinanceColumnMapping> findByTeamIdAndProviderKeyIgnoreCase(UUID teamId, String providerKey);
}
