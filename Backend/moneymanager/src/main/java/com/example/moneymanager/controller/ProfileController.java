package com.example.moneymanager.controller;

import com.example.moneymanager.dto.AuthDTO;
import com.example.moneymanager.dto.AutoRenewRequestDTO;
import com.example.moneymanager.dto.ForgotPasswordRequestDTO;
import com.example.moneymanager.dto.ProfileDTO;
import com.example.moneymanager.dto.ResetPasswordRequestDTO;
import com.example.moneymanager.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping("/register")
    public ResponseEntity<ProfileDTO> registerProfile(@RequestBody ProfileDTO profileDTO) {
        ProfileDTO registeredProfile = profileService.registerProfile(profileDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(registeredProfile);
    }

    @GetMapping("/activate")
    public ResponseEntity<String> activateProfile(@RequestParam String token) {
        boolean isActivated = profileService.activateProfile(token);
        if (isActivated) {
            return ResponseEntity.ok("Profile activated successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Activation token not found or already used");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthDTO authDTO) {
        try {
            if (!profileService.isAccountActive(authDTO.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "message", "Account is not active. Please activate your account first."
                ));
            }
            Map<String, Object> response = profileService.authenticateAndGenerateToken(authDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileDTO> getPublicProfile() {
        ProfileDTO profileDTO = profileService.getPublicProfile(null);
        return ResponseEntity.ok(profileDTO);
    }

    @PutMapping("/profile/subscription/auto-renew")
    public ResponseEntity<ProfileDTO> updateAutoRenew(@RequestBody AutoRenewRequestDTO requestDTO) {
        return ResponseEntity.ok(profileService.updateAutoRenew(requestDTO));
    }

    // Thêm các endpoint mới cho quên mật khẩu

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPasswordRequestDTO requestDTO) {
        try {
            profileService.forgotPassword(requestDTO);
            return ResponseEntity.ok(Map.of(
                    "message", "Password reset link has been sent to your email"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }
    @GetMapping("/reset-password")
    public void redirectToFrontend(@RequestParam String token, HttpServletResponse response) throws IOException {
        response.sendRedirect("http://localhost:3000/reset-password?token=" + token);
    }
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordRequestDTO requestDTO) {
        try {
            profileService.resetPassword(requestDTO);
            return ResponseEntity.ok(Map.of(
                    "message", "Password has been reset successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }
}