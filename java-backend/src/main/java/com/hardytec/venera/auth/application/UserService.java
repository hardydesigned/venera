package com.hardytec.venera.auth.application;

import com.hardytec.venera.auth.adapters.web.dto.SignUpRequest;
import com.hardytec.venera.auth.adapters.web.dto.UserCreateRequest;
import com.hardytec.venera.auth.adapters.web.dto.UserDto;
import com.hardytec.venera.auth.adapters.web.dto.UserUpdateRequest;
import com.hardytec.venera.auth.domain.UserAccount;
import com.hardytec.venera.auth.adapters.persistence.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    private final Logger logger = LoggerFactory.getLogger(OttLoginService.class);

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserDto> listUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    public UserDto getById(String userId) {
        return mapToDto(findUser(userId));
    }

    public UserDto create(UserCreateRequest request) {
        validateEmailAvailability(request.email(), null);
        if (request.password() == null || request.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password required");
        }
        UserAccount user = new UserAccount();
        user.setEmail(request.email());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setActive(Boolean.TRUE.equals(request.isActive()));
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        return mapToDto(userRepository.save(user));
    }

    public UserDto signUp(SignUpRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            logger.info("Passwords dont match");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords dont match");
        }
        validateEmailAvailability(request.email(), null);
        UserAccount user = new UserAccount();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setActive(true);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        return mapToDto(userRepository.save(user));
    }

    public UserDto update(String userId, UserUpdateRequest request) {
        UserAccount user = findUser(userId);
        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())) {
            validateEmailAvailability(request.email(), user.getId());
            user.setEmail(request.email());
        }
        if (request.firstName() != null) {
            if (request.firstName().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vorname darf nicht leer sein");
            }
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            if (request.lastName().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nachname darf nicht leer sein");
            }
            user.setLastName(request.lastName());
        }
        if (request.isActive() != null) {
            user.setActive(request.isActive());
        }
        if (request.onboardingCompleted() != null) {
            user.setOnboardingCompleted(request.onboardingCompleted());
        }   
        if (request.password() != null) {
            if (request.password().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwort darf nicht leer sein");
            }
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        return mapToDto(userRepository.save(user));
    }

    public void delete(String userId) {
        userRepository.delete(findUser(userId));
    }

    public UserDto getByEmail(String email) {
        return mapToDto(userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")));
    }

    public UserAccount getEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private void validateEmailAvailability(String email, UUID currentId) {
        userRepository.findByEmail(email).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                logger.info("E-Mail already in use");
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-Mail already in use");
            }
        });
    }

    private UserAccount findUser(String userId) {
        UUID id = parseUuid(userId);
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private UUID parseUuid(String id) {
        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid ID: " + id);
        }
    }

    private UserDto mapToDto(UserAccount user) {
        return new UserDto(
                user.getId().toString(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.isActive(),
                user.getOnboardingCompleted(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }

    public void changePassword(UserAccount user, String newPassword) {
        user.setPasswordHash(passwordEncoder.encode(newPassword));

        userRepository.save(user);
    }
}
