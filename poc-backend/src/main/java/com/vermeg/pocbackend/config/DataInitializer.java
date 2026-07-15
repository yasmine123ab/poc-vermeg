package com.vermeg.pocbackend.config;

import com.vermeg.pocbackend.model.User;
import com.vermeg.pocbackend.model.enums.UserRole;
import com.vermeg.pocbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        User admin = User.builder()
                .username("admin")
                .email("admin@vermeg.com")
                .password(passwordEncoder.encode("admin123"))
                .firstName("Admin")
                .lastName("Vermeg")
                .avatarInitials("AV")
                .role(UserRole.ADMIN)
                .enabled(true)
                .build();

        User operator = User.builder()
                .username("operator")
                .email("operator@vermeg.com")
                .password(passwordEncoder.encode("operator123"))
                .firstName("Operator")
                .lastName("Vermeg")
                .avatarInitials("OV")
                .role(UserRole.OPERATOR)
                .enabled(true)
                .build();

        userRepository.save(admin);
        userRepository.save(operator);

        log.info("Default users created: admin/admin123 (ADMIN), operator/operator123 (OPERATOR)");
    }
}
