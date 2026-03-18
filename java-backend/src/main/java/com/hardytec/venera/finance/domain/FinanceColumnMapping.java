package com.hardytec.venera.finance.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@NoArgsConstructor
@Table(name = "finance_mappings")
public class FinanceColumnMapping {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = true)
    private UUID userId;

    @Column(nullable = true)
    private UUID teamId;

    @Column(nullable = false)
    private String providerKey;

    @Column(nullable = false)
    private String dateColumn;

    @Column(nullable = false)
    private String payeeColumn;

    @Column(nullable = false)
    private String purposeColumn;

    @Column(nullable = false)
    private String amountColumn;

    @Column(nullable = false)
    private String delimiter;

    @Column(nullable = true)
    private String dateFormat;

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
