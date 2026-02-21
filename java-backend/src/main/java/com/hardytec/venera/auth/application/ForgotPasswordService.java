package com.hardytec.venera.auth.application;

import com.hardytec.venera.auth.domain.ForgotPasswordToken;
import com.hardytec.venera.auth.domain.UserAccount;
import com.hardytec.venera.auth.adapters.persistence.ForgotPasswordRepository;
import com.hardytec.venera.auth.adapters.persistence.UserRepository;
import jakarta.validation.constraints.NotBlank;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class ForgotPasswordService {
    @Value("${jwt.refreshExpirationMs}")
    private Long refreshTokenDurationMs;

    @Value("${hardytec.callbackUrl-reset-password}")
    private String callbackUrlResetPassword;

    private final ForgotPasswordRepository forgotPasswordRepository;
    private final UserRepository userRepository;

    private final Logger logger = LoggerFactory.getLogger(ForgotPasswordService.class);

    private final String senderAddress;
    private final JavaMailSender mailSender;


    public ForgotPasswordService(ForgotPasswordRepository repo, UserRepository userRepo, JavaMailSender mailSender, @Value("${hardytec.mail.from:${spring.mail.username:}}") String senderAddress ) {
        this.forgotPasswordRepository = repo;
        this.userRepository = userRepo;
        this.senderAddress = senderAddress;
        this.mailSender = mailSender;
    }

    @Transactional
    public ForgotPasswordToken createForgotPasswordToken(UUID userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        OffsetDateTime newExpiry = OffsetDateTime.now().plusSeconds(refreshTokenDurationMs / 1000);
        Optional<ForgotPasswordToken> existingToken = forgotPasswordRepository.findByUserId(userId);

        ForgotPasswordToken token = existingToken.orElseGet(ForgotPasswordToken::new);
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiryDate(newExpiry);

        return forgotPasswordRepository.save(token);
    }

    public boolean isTokenExpired(ForgotPasswordToken token) {
        return token.getExpiryDate().isBefore(OffsetDateTime.now());
    }

    @Transactional
    public void sendToken(String email) {
        UserAccount user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        ForgotPasswordToken forgotPasswordToken = createForgotPasswordToken(user.getId());

        forgotPasswordRepository.save(forgotPasswordToken);

        sendMail(user, forgotPasswordToken.getToken());
    }

    private void sendMail(UserAccount user, String tokenValue) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        if (senderAddress != null && !senderAddress.isBlank()) {
            message.setFrom(senderAddress);
            message.setReplyTo(senderAddress);
        }
        message.setSubject("Deine Anfrage zur Passwort-Reset-Anfrage");
        message.setText(buildMailBody(user, tokenValue));

        mailSender.send(message);
    }

    private String buildMailBody(UserAccount user, String tokenValue) {
        String loginLink = UriComponentsBuilder.fromUriString(callbackUrlResetPassword)
                .queryParam("resetPasswordToken", tokenValue)
                .build()
                .toUriString();
        return """
                Hallo %s,

                Du kannst über folgenden Link dein Passwort resetten:
                %s

                Viele Gruesse
                Dein HTI-Control-Team
                """.formatted(
                user.getFirstName(),
                loginLink
                );
    }


    public UserAccount validateToken(@NotBlank String token) {
        ForgotPasswordToken forgotPasswordToken = forgotPasswordRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Token not found"));

        if (isTokenExpired(forgotPasswordToken)) {
            forgotPasswordRepository.delete(forgotPasswordToken);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token is expired");
        }

        return forgotPasswordToken.getUser();
    }
}
