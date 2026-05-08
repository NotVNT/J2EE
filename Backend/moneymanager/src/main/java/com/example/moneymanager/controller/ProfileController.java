package com.example.moneymanager.controller;

import com.example.moneymanager.dto.AuthDTO;
import com.example.moneymanager.dto.AutoRenewRequestDTO;
import com.example.moneymanager.dto.ForgotPasswordRequestDTO;
import com.example.moneymanager.dto.ProfileDTO;
import com.example.moneymanager.dto.ProfileUpdateDTO;
import com.example.moneymanager.dto.ResetPasswordRequestDTO;
import com.example.moneymanager.dto.ResendOtpRequestDTO;
import com.example.moneymanager.dto.SetupProfileDTO;
import com.example.moneymanager.dto.VerifyOtpRequestDTO;
import com.example.moneymanager.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
    public ResponseEntity<?> registerProfile(@RequestBody ProfileDTO profileDTO) {
        try {
            ProfileDTO registeredProfile = profileService.registerProfile(profileDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredProfile);
        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Lỗi hệ thống không xác định: " + e.getClass().getSimpleName();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", errorMsg
            ));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody VerifyOtpRequestDTO requestDTO) {
        try {
            profileService.verifyOtp(requestDTO.getEmail(), requestDTO.getOtpCode());
            return ResponseEntity.ok(Map.of("message", "Xác thực tài khoản thành công."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(@RequestBody ResendOtpRequestDTO requestDTO) {
        try {
            profileService.resendOtp(requestDTO.getEmail());
            return ResponseEntity.ok(Map.of("message", "Mã OTP đã được gửi lại tới email của bạn."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage()
            ));
        }
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
                        "message", "Tài khoản chưa được kích hoạt. Vui lòng kích hoạt tài khoản trước.",
                        "needsActivation", true,
                        "email", authDTO.getEmail()
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

    @PutMapping("/complete-profile")
    public ResponseEntity<Map<String, Object>> completeProfile(@RequestBody SetupProfileDTO requestDTO) {
        try {
            Map<String, Object> response = profileService.completeProfile(requestDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage()
            ));
        }
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
    @Value("${money.manager.frontend.url}")
    private String frontendUrl;

    @GetMapping("/reset-password")
    public void redirectToFrontend(@RequestParam String token, HttpServletResponse response) throws IOException {
        String normalizedUrl = frontendUrl.endsWith("/")
                ? frontendUrl.substring(0, frontendUrl.length() - 1)
                : frontendUrl;
        response.sendRedirect(normalizedUrl + "/reset-password?token=" + token);
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
