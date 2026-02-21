package com.hardytec.venera.auth.adapters.persistence;

import com.hardytec.venera.auth.domain.ForgotPasswordToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ForgotPasswordRepository extends JpaRepository<ForgotPasswordToken, Long> {
    Optional<ForgotPasswordToken> findByToken(String token);

    Optional<ForgotPasswordToken> findByUserId(UUID userId);
}
