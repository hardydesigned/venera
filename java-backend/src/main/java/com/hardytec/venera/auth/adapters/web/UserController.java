package com.hardytec.venera.auth.adapters.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hardytec.venera.auth.adapters.web.dto.UserCreateRequest;
import com.hardytec.venera.auth.adapters.web.dto.UserDto;
import com.hardytec.venera.auth.adapters.web.dto.UserUpdateRequest;
import com.hardytec.venera.auth.application.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {"${hardytec.cors.allowed-origins}"})
public class UserController {

    private final UserService userService;
    private final CurrentUserResolver currentUserResolver;

    public UserController(UserService userService, CurrentUserResolver currentUserResolver) {
        this.userService = userService;
        this.currentUserResolver = currentUserResolver;
    }

    @PostMapping
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserDto created = userService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUser(@PathVariable String userId) {
        verifyCurrentUser(userId);
        return ResponseEntity.ok(userService.getById(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable String userId,
            @Valid @RequestBody UserUpdateRequest request) {
        verifyCurrentUser(userId);
        return ResponseEntity.ok(userService.update(userId, request));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        verifyCurrentUser(userId);
        userService.delete(userId);
        return ResponseEntity.noContent().build();
    }

    private void verifyCurrentUser(String userId) {
        if (!currentUserResolver.getCurrentUserId().toString().equals(userId)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
        }
    }
}
