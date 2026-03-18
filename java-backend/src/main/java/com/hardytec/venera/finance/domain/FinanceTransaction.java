package com.hardytec.venera.finance.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Entity
@NoArgsConstructor
@Table(name = "finance_transactions")
public class FinanceTransaction {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = true)
    private UUID userId;

    @Column(nullable = true)
    private UUID teamId;

    @Column(nullable = false)
    private LocalDate bookingDate;

    @Column(nullable = false, columnDefinition = "text")
    private String payee;

    @Column(nullable = true, columnDefinition = "text")
    private String purpose;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(nullable = true)
    private String categoryMain;

    @Column(nullable = true)
    private String categorySub;

    @Column(nullable = true)
    private Double confidence;

    @Column(nullable = true)
    private String sourceProviderKey;

    @Column(nullable = false)
    private String dedupeHash;

    @Column(nullable = false)
    private boolean manualOverride;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
