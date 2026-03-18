package com.hardytec.venera.finance.adapters.persistence;

import com.hardytec.venera.finance.domain.FinanceTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FinanceTransactionRepository extends JpaRepository<FinanceTransaction, UUID> {

    List<FinanceTransaction> findByUserIdAndTeamIdIsNullAndBookingDateBetweenOrderByBookingDateDesc(UUID userId, LocalDate from, LocalDate to);

    List<FinanceTransaction> findByTeamIdAndBookingDateBetweenOrderByBookingDateDesc(UUID teamId, LocalDate from, LocalDate to);

    @Query("select t from FinanceTransaction t where t.userId = :userId and t.teamId is null and year(t.bookingDate) = :year")
    List<FinanceTransaction> findAllForUserAndYear(@Param("userId") UUID userId, @Param("year") int year);

    @Query("select t from FinanceTransaction t where t.teamId = :teamId and year(t.bookingDate) = :year")
    List<FinanceTransaction> findAllForTeamAndYear(@Param("teamId") UUID teamId, @Param("year") int year);

    boolean existsByUserIdAndTeamIdIsNullAndDedupeHash(UUID userId, String dedupeHash);

    boolean existsByTeamIdAndDedupeHash(UUID teamId, String dedupeHash);

    Optional<FinanceTransaction> findByIdAndUserIdAndTeamIdIsNull(UUID id, UUID userId);

    Optional<FinanceTransaction> findByIdAndTeamId(UUID id, UUID teamId);
}
