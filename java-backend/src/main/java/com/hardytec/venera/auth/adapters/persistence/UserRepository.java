package com.hardytec.venera.auth.adapters.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hardytec.venera.auth.domain.UserAccount;

@Repository
public interface UserRepository extends JpaRepository<UserAccount, UUID> {

    Optional<UserAccount> findByEmail(String email);
    Optional<UserAccount> findByEmailIgnoreCase(String email);

    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
}
