package com.hardytec.venera.auth.adapters.persistence;

import com.hardytec.venera.auth.domain.OneTimeToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public interface OneTimeTokenRepository extends JpaRepository<OneTimeToken, Long> {
    Optional<OneTimeToken> findByTokenValueAndUsedFalse(String tokenValue);

    List<OneTimeToken> findByUsernameAndUsedFalse(String username);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
