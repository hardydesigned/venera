package com.hardytec.venera.auth.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "one_time_tokens") 
public class OneTimeToken {
    @Id
    @GeneratedValue
    private Long id;

    private String tokenValue;
    private String username;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean used;
}
