package com.example.moneymanager.controller;

import com.example.moneymanager.dto.AuthDTO;
import com.example.moneymanager.dto.AutoRenewRequestDTO;
import com.example.moneymanager.dto.ForgotPasswordRequestDTO;
import com.example.moneymanager.dto.ProfileDTO;
import com.example.moneymanager.dto.ProfileUpdateDTO;
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
            return ResponseEntity.ok("Kích hoạt tài khoản thành công.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Liên kết kích hoạt không tồn tại hoặc đã được sử dụng.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthDTO authDTO) {
        try {
            if (!profileService.isAccountActive(authDTO.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "message", "Tài khoản chưa được kích hoạt. Vui lòng kích hoạt tài khoản trước."
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

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody ProfileUpdateDTO requestDTO) {
        return ResponseEntity.ok(profileService.updateProfile(requestDTO));
    }

    @PutMapping("/profile/subscription/auto-renew")
    public ResponseEntity<ProfileDTO> updateAutoRenew(@RequestBody AutoRenewRequestDTO requestDTO) {
        return ResponseEntity.ok(profileService.updateAutoRenew(requestDTO));
    }

    // Các endpoint cho chức năng quên mật khẩu

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPasswordRequestDTO requestDTO) {
        try {
            profileService.forgotPassword(requestDTO);
            return ResponseEntity.ok(Map.of(
                    "message", "Liên kết đặt lại mật khẩu đã được gửi tới email của bạn."
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
                    "message", "Đặt lại mật khẩu thành công."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }
}
