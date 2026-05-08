package com.example.moneymanager.controller;

    import com.example.moneymanager.entity.ProfileEntity;
    import com.example.moneymanager.service.*;
    import jakarta.mail.MessagingException;
    import lombok.RequiredArgsConstructor;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RestController;

    import java.io.ByteArrayOutputStream;
    import java.io.IOException;

    @RestController
    @RequestMapping("/email")
    @RequiredArgsConstructor
    public class EmailController {

        private final ExcelService excelService;
        private final IncomeService incomeService;
        private final ExpenseService expenseService;
        private final EmailService emailService;
        private final ProfileService profileService;
        private final SubscriptionService subscriptionService;
        private final DocumentService documentService;

        @GetMapping("/income-excel")
        public ResponseEntity<Void> emailIncomeExcel() throws IOException, MessagingException {
            subscriptionService.ensureCanExport(profileService.getCurrentProfile());
            ProfileEntity profile = profileService.getCurrentProfile();

            // 1. Lấy danh sách thu nhập
            java.util.List<com.example.moneymanager.dto.IncomeDTO> incomes = incomeService.getCurrentMonthIncomesForCurrentUser();
            java.util.List<java.util.Map<String, Object>> incomeMapList = incomes.stream().map(dto -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("name", dto.getName());
                map.put("date", dto.getDate().toString());
                map.put("amount", dto.getAmount());
                map.put("category", dto.getCategoryName());
                return map;
            }).collect(java.util.stream.Collectors.toList());

            // 2. Gọi AWS Lambda sinh file Excel và lưu lên S3
            java.time.LocalDate now = java.time.LocalDate.now();
            java.util.Map<String, String> lambdaResult = documentService.generateExcelReport(
                    profile.getEmail(), now.getMonthValue(), now.getYear(), incomeMapList
            );

            String s3Link = lambdaResult.get("presignedUrl");

            // 3. Gửi Email kèm link S3
            String htmlBody = "<html><body>"
                    + "<h3>Chào bạn,</h3>"
                    + "<p>Báo cáo thu nhập tháng <b>" + now.getMonthValue() + "/" + now.getYear() + "</b> của bạn đã được tạo thành công và lưu trữ an toàn trên hệ thống đám mây AWS S3.</p>"
                    + "<p>Vui lòng click vào nút bên dưới để tải báo cáo về máy (link có giá trị bảo mật trong 1 giờ):</p>"
                    + "<a href='" + s3Link + "' style='display:inline-block; padding:10px 20px; background-color:#7C3AED; color:#ffffff; text-decoration:none; border-radius:5px;'>📥 Tải Báo Cáo Excel (AWS S3)</a>"
                    + "<p><br/>Cảm ơn bạn đã sử dụng MoneyManager!</p>"
                    + "</body></html>";

            emailService.sendHtmlEmail(
                    profile.getEmail(),
                    "Báo cáo thu nhập tháng " + now.getMonthValue() + " (Lưu trữ AWS S3)",
                    htmlBody);

            return ResponseEntity.ok(null);
        }

        @GetMapping("/expense-excel")
        public ResponseEntity<Void> emailExpenseExcel() throws IOException, MessagingException {
            subscriptionService.ensureCanExport(profileService.getCurrentProfile());
            ProfileEntity profile = profileService.getCurrentProfile();

            // 1. Lấy danh sách chi tiêu
            java.util.List<com.example.moneymanager.dto.ExpenseDTO> expenses = expenseService.getCurrentMonthExpensesForCurrentUser();
            java.util.List<java.util.Map<String, Object>> expenseMapList = expenses.stream().map(dto -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("name", dto.getName());
                map.put("date", dto.getDate().toString());
                map.put("amount", dto.getAmount());
                map.put("category", dto.getCategoryName());
                return map;
            }).collect(java.util.stream.Collectors.toList());

            // 2. Gọi AWS Lambda sinh file Excel và lưu lên S3
            java.time.LocalDate now = java.time.LocalDate.now();
            java.util.Map<String, String> lambdaResult = documentService.generateExcelReport(
                    profile.getEmail(), now.getMonthValue(), now.getYear(), expenseMapList
            );

            String s3Link = lambdaResult.get("presignedUrl");

            // 3. Gửi Email đính kèm link S3
            String htmlBody = "<html><body>"
                    + "<h3>Chào bạn,</h3>"
                    + "<p>Báo cáo chi tiêu tháng <b>" + now.getMonthValue() + "/" + now.getYear() + "</b> của bạn đã được tạo thành công và lưu trữ an toàn trên hệ thống đám mây AWS S3.</p>"
                    + "<p>Vui lòng click vào nút bên dưới để tải báo cáo về máy (link có giá trị bảo mật trong 1 giờ):</p>"
                    + "<a href='" + s3Link + "' style='display:inline-block; padding:10px 20px; background-color:#7C3AED; color:#ffffff; text-decoration:none; border-radius:5px;'>📥 Tải Báo Cáo Excel (AWS S3)</a>"
                    + "<p><br/>Cảm ơn bạn đã sử dụng MoneyManager!</p>"
                    + "</body></html>";

            emailService.sendHtmlEmail(
                    profile.getEmail(),
                    "Báo cáo chi tiêu tháng " + now.getMonthValue() + " (Lưu trữ AWS S3)",
                    htmlBody);

            return ResponseEntity.ok(null);
        }
    }
