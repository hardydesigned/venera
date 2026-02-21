package com.hardytec.venera.auth.application;

import com.hardytec.venera.auth.domain.RefreshToken;
import com.hardytec.venera.auth.adapters.persistence.RefreshTokenRepository;
import com.hardytec.venera.auth.adapters.persistence.UserRepository;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RefreshTokenService {
    @Value("${jwt.refreshExpirationMs}")
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public RefreshTokenService(RefreshTokenRepository repo, UserRepository userRepo) {
        this.refreshTokenRepository = repo;
        this.userRepository = userRepo;
    }

    @Transactional
    public RefreshToken createRefreshToken(UUID userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        OffsetDateTime newExpiry = OffsetDateTime.now().plusSeconds(refreshTokenDurationMs / 1000);
        Optional<RefreshToken> existingToken = refreshTokenRepository.findByUserId(userId);

        RefreshToken token = existingToken.orElseGet(RefreshToken::new);
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiryDate(newExpiry);

        existingToken.ifPresent(t -> System.out.println("Token already exists, updating existing token."));

        return refreshTokenRepository.save(token);
    }

    public boolean isTokenExpired(RefreshToken token) {
        return token.getExpiryDate().isBefore(OffsetDateTime.now());
    }
}
