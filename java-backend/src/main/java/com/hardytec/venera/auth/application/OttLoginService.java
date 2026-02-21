package com.hardytec.venera.auth.application;

import com.hardytec.venera.auth.domain.OneTimeToken;
import com.hardytec.venera.auth.domain.UserAccount;
import com.hardytec.venera.auth.adapters.persistence.OneTimeTokenRepository;
import com.hardytec.venera.auth.adapters.persistence.UserRepository;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class OttLoginService {

    private final Logger logger = LoggerFactory.getLogger(OttLoginService.class);

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int DEFAULT_TOKEN_BYTES = 32;

    @Value("${hardytec.auth.ott.callbackUrl}")
    private String ottCallbackUrl;

    private final OneTimeTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final int tokenValidityMinutes;
    private final String senderAddress;

    public OttLoginService(
            OneTimeTokenRepository tokenRepository,
            UserRepository userRepository,
            JavaMailSender mailSender,
            @Value("${hardytec.auth.ott.expiration-minutes:15}") int tokenValidityMinutes,
            @Value("${hardytec.mail.from:${spring.mail.username:}}") String senderAddress
          ) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
        this.tokenValidityMinutes = tokenValidityMinutes;
        this.senderAddress = senderAddress;
    }

    @Transactional
    public void sendToken(String email) {
        UserAccount user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        LocalDateTime now = LocalDateTime.now();
        tokenRepository.deleteByExpiresAtBefore(now);

        invalidateActiveTokens(user.getEmail());

        String tokenValue = generateTokenValue();
        OneTimeToken token = new OneTimeToken();
        token.setTokenValue(tokenValue);
        token.setUsername(user.getEmail());
        token.setCreatedAt(now);
        token.setExpiresAt(now.plusMinutes(tokenValidityMinutes));
        token.setUsed(false);

        tokenRepository.save(token);

        sendMail(user, tokenValue);
    }

    @Transactional
    public UserAccount consumeToken(String tokenValue) {
        OneTimeToken token = tokenRepository.findByTokenValueAndUsedFalse(tokenValue)
                .orElseThrow(() -> new BadCredentialsException("Invalid Token"));

        LocalDateTime now = LocalDateTime.now();
        if (token.getExpiresAt() != null && token.getExpiresAt().isBefore(now)) {
            token.setUsed(true);
            tokenRepository.save(token);
            throw new BadCredentialsException("Token expired");
        }

        token.setUsed(true);
        tokenRepository.save(token);

        return userRepository.findByEmail(token.getUsername())
                .orElseThrow(() -> new BadCredentialsException("No User for Token"));
    }

    private void invalidateActiveTokens(String email) {
        List<OneTimeToken> activeTokens = tokenRepository.findByUsernameAndUsedFalse(email);
        if (activeTokens.isEmpty()) {
            return;
        }
        activeTokens.forEach(token -> token.setUsed(true));
        tokenRepository.saveAll(activeTokens);
    }

    private String generateTokenValue() {
        byte[] bytes = new byte[DEFAULT_TOKEN_BYTES];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void sendMail(UserAccount user, String tokenValue) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        if (senderAddress != null && !senderAddress.isBlank()) {
            message.setFrom(senderAddress);
            message.setReplyTo(senderAddress);
        }
        message.setSubject("Dein einmaliger Login-Code");
        message.setText(buildMailBody(user, tokenValue));

        System.out.println("Sending mail to " + user.getEmail());

        mailSender.send(message);

        System.out.println("Mail sent to " + user.getEmail());
    }

    private String buildMailBody(UserAccount user, String tokenValue) {
        String loginLink = UriComponentsBuilder.fromUriString(ottCallbackUrl)
                .queryParam("token", tokenValue)
                .build()
                .toUriString();
        return """
                Hallo %s,

                Dein Einmal-Login-Code lautet: %s

                Du kannst dich alternativ ueber folgenden Link anmelden:
                %s

                Der Code ist %d Minuten gueltig.

                Viele Gruesse
                Dein HTI-Control-Team
                """.formatted(
                user.getFirstName(),
                tokenValue,
                loginLink,
                tokenValidityMinutes);
    }
}
