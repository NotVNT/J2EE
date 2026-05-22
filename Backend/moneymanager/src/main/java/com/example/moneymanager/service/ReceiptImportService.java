package com.example.moneymanager.service;

import com.example.moneymanager.config.NineRouterProperties;
import org.springframework.beans.factory.annotation.Qualifier;
import com.example.moneymanager.dto.ExpenseDTO;
import com.example.moneymanager.dto.ExpenseResponseDTO;
import com.example.moneymanager.dto.ReceiptImportAnalyzeResponseDTO;
import com.example.moneymanager.dto.ReceiptImportConfirmRequestDTO;
import com.example.moneymanager.dto.ReceiptImportItemDTO;
import com.example.moneymanager.dto.ReceiptImportResponseDTO;
import com.example.moneymanager.entity.CategoryEntity;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.repository.CategoryRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReceiptImportService {

    private static final long MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
    private static final String EXPENSE_TYPE = "expense";
    private static final String OTHER_CATEGORY_NAME = "Khác";
    private static final String OTHER_CATEGORY_ICON = "CircleHelp";

    @Qualifier("nineRouterAgentRestClient")
    private final RestClient nineRouterAgentRestClient;
    private final NineRouterProperties nineRouterProperties;
    private final ObjectMapper objectMapper;
    private final ProfileService profileService;
    private final CategoryRepository categoryRepository;
    private final ExpenseService expenseService;
    private final SubscriptionService subscriptionService;

    public ReceiptImportResponseDTO importReceipt(MultipartFile file) {
        ReceiptImportAnalyzeResponseDTO preview = analyzeReceipt(file);
        return confirmImport(ReceiptImportConfirmRequestDTO.builder()
            .merchant(preview.getMerchant())
            .location(preview.getLocation())
            .receiptDate(preview.getReceiptDate())
            .items(preview.getItems())
            .build());
        }

        public ReceiptImportAnalyzeResponseDTO analyzeReceipt(MultipartFile file) {
        ProfileEntity profile = profileService.getCurrentProfile();
        subscriptionService.ensureCanImportReceipt(profile);
        validateFile(file);

        List<CategoryEntity> expenseCategories = new ArrayList<>(
                categoryRepository.findByTypeAndProfileId(EXPENSE_TYPE, profile.getId())
        );
        CategoryEntity otherCategory = ensureOtherExpenseCategory(profile, expenseCategories);

        JsonNode aiResult = analyzeReceiptWithOpenModel(file, expenseCategories);
        return buildPreviewFromAiResult(aiResult, expenseCategories, otherCategory);
    }

    public ReceiptImportResponseDTO confirmImport(ReceiptImportConfirmRequestDTO requestDTO) {
        ProfileEntity profile = profileService.getCurrentProfile();
        subscriptionService.ensureCanImportReceipt(profile);

        if (requestDTO == null || requestDTO.getItems() == null || requestDTO.getItems().isEmpty()) {
            throw new RuntimeException("Danh sách chi tiêu import không được để trống.");
        }

        String merchant = safeText(requestDTO.getMerchant());
        String location = safeText(requestDTO.getLocation());
        String normalizedReceiptLocation = !location.isBlank() ? location : merchant;
        LocalDate defaultDate = requestDTO.getReceiptDate() != null ? requestDTO.getReceiptDate() : LocalDate.now();
        List<CategoryEntity> expenseCategories = new ArrayList<>(
            categoryRepository.findByTypeAndProfileId(EXPENSE_TYPE, profile.getId())
        );
        CategoryEntity otherCategory = ensureOtherExpenseCategory(profile, expenseCategories);

        List<ExpenseDTO> importedExpenses = new ArrayList<>();
        for (ReceiptImportItemDTO item : requestDTO.getItems()) {
            if (item == null) {
                continue;
            }

            String itemName = safeText(item.getName());
            BigDecimal amount = item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO;
            if (itemName.isBlank() || amount.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

                CategoryEntity matchedCategory = item.getCategoryId() != null
                    ? categoryRepository.findByIdAndProfileId(item.getCategoryId(), profile.getId())
                    .orElse(otherCategory)
                    : otherCategory;

            LocalDate transactionDate = item.getDate() != null ? item.getDate() : defaultDate;
            ExpenseResponseDTO created = expenseService.addExpense(
                    ExpenseDTO.builder()
                            .name(itemName)
                            .icon(item.getIcon() != null && !item.getIcon().isBlank() ? item.getIcon() : matchedCategory.getIcon())
                            .receiptLocation(normalizedReceiptLocation)
                            .categoryId(matchedCategory.getId())
                            .amount(amount)
                            .date(transactionDate)
                            .jarId(requestDTO.getJarId())
                            .build()
            );

            importedExpenses.add(ExpenseDTO.builder()
                    .id(created.getId())
                    .name(created.getName())
                    .icon(created.getIcon())
                    .receiptLocation(created.getReceiptLocation())
                    .categoryId(created.getCategoryId())
                    .categoryName(created.getCategoryName())
                    .amount(created.getAmount())
                    .date(created.getDate())
                    .createdAt(created.getCreatedAt())
                    .updatedAt(created.getUpdatedAt())
                    .build());
        }

        if (importedExpenses.isEmpty()) {
            throw new RuntimeException("Không có dòng chi tiêu hợp lệ để lưu từ hóa đơn.");
        }

        return ReceiptImportResponseDTO.builder()
                .merchant(merchant)
                .receiptDate(requestDTO.getReceiptDate())
                .detectedItemCount(requestDTO.getItems().size())
                .importedCount(importedExpenses.size())
                .importedExpenses(importedExpenses)
                .build();
    }

        private ReceiptImportAnalyzeResponseDTO buildPreviewFromAiResult(
            JsonNode aiResult,
            List<CategoryEntity> expenseCategories,
            CategoryEntity otherCategory
        ) {
        LocalDate receiptDate = parseReceiptDate(aiResult.path("receiptDate").asText(null));
        String merchant = safeText(aiResult.path("merchant").asText(""));
        String receiptLocation = safeText(aiResult.path("location").asText(""));

        JsonNode itemsNode = aiResult.path("items");
        if (!itemsNode.isArray() || itemsNode.isEmpty()) {
            throw new RuntimeException("Không tìm thấy dòng chi tiêu hợp lệ từ hình ảnh hóa đơn.");
        }

        List<ReceiptImportItemDTO> items = new ArrayList<>();
        for (JsonNode item : itemsNode) {
            String itemName = safeText(item.path("name").asText(""));
            BigDecimal amount = parseAmount(item.path("amount"));
            String categoryName = safeText(item.path("categoryName").asText(""));

            if (itemName.isBlank() || amount.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            LocalDate transactionDate = receiptDate != null ? receiptDate : LocalDate.now();
            CategoryEntity matchedCategory = resolveCategory(expenseCategories, categoryName, itemName, otherCategory);
            items.add(ReceiptImportItemDTO.builder()
                    .name(itemName)
                    .amount(amount)
                    .categoryId(matchedCategory.getId())
                    .categoryHint(categoryName)
                    .icon(matchedCategory.getIcon())
                    .date(transactionDate)
                    .build());
        }

        if (items.isEmpty()) {
            throw new RuntimeException("Không có dòng chi tiêu hợp lệ để preview từ hóa đơn.");
        }

        return ReceiptImportAnalyzeResponseDTO.builder()
                .merchant(merchant)
                .location(receiptLocation)
                .receiptDate(receiptDate)
                .detectedItemCount(itemsNode.size())
                .items(items)
                .build();
    }

    private static final byte[] MAGIC_JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] MAGIC_PNG  = {(byte) 0x89, 0x50, 0x4E, 0x47};
    private static final byte[] MAGIC_GIF  = {0x47, 0x49, 0x46, 0x38};
    private static final byte[] MAGIC_WEBP_RIFF = {0x52, 0x49, 0x46, 0x46};

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn hình ảnh hóa đơn để import.");
        }

        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new RuntimeException("Kích thước ảnh quá lớn. Vui lòng chọn ảnh tối đa 10MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new RuntimeException("Định dạng tệp không hợp lệ. Vui lòng chọn tệp ảnh.");
        }

        try {
            byte[] header = file.getBytes();
            if (!hasValidImageMagicBytes(header)) {
                throw new RuntimeException("Nội dung tệp không hợp lệ. Vui lòng chọn tệp ảnh thực sự.");
            }
        } catch (java.io.IOException e) {
            throw new RuntimeException("Không thể đọc tệp ảnh.", e);
        }
    }

    private boolean hasValidImageMagicBytes(byte[] data) {
        if (data == null || data.length < 4) return false;
        return startsWith(data, MAGIC_JPEG)
                || startsWith(data, MAGIC_PNG)
                || startsWith(data, MAGIC_GIF)
                || (startsWith(data, MAGIC_WEBP_RIFF) && data.length >= 12
                        && data[8] == 0x57 && data[9] == 0x45 && data[10] == 0x42 && data[11] == 0x50);
    }

    private boolean startsWith(byte[] data, byte[] prefix) {
        if (data.length < prefix.length) return false;
        for (int i = 0; i < prefix.length; i++) {
            if (data[i] != prefix[i]) return false;
        }
        return true;
    }

    private JsonNode analyzeReceiptWithOpenModel(MultipartFile file, List<CategoryEntity> expenseCategories) {
        try {
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            ObjectNode requestBody = buildOpenAIImageRequest(base64Image, file.getContentType(), expenseCategories);

            String requestJson = objectMapper.writeValueAsString(requestBody);
            String responseJson = nineRouterAgentRestClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + nineRouterProperties.agent().apiKey())
                    .body(requestJson)
                    .retrieve()
                    .body(String.class);

            if (responseJson == null || responseJson.isBlank()) {
                throw new RuntimeException("Model không trả về dữ liệu để phân tích hóa đơn.");
            }

            JsonNode root = objectMapper.readTree(responseJson);
            String text = extractOpenAIOutputText(root);
            if (text == null || text.isBlank()) {
                throw new RuntimeException("Model không trả về kết quả phân tích hóa đơn hợp lệ.");
            }

            String cleanJson = sanitizeJsonResponse(text);
            return objectMapper.readTree(cleanJson);
        } catch (Exception exception) {
            throw new RuntimeException("Không thể kết nối", exception);
        }
    }

    private ObjectNode buildOpenAIImageRequest(String base64Image, String mimeType, List<CategoryEntity> expenseCategories) {
        List<String> categoryNames = expenseCategories.stream()
                .map(CategoryEntity::getName)
                .collect(Collectors.toCollection(ArrayList::new));
        if (categoryNames.stream().noneMatch(n -> Normalizer.normalize(n, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).equals("khac"))) {
            categoryNames.add(OTHER_CATEGORY_NAME);
        }
        String categoryListText = String.join(", ", categoryNames);

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", nineRouterProperties.agent().model());
        requestBody.put("temperature", 0.1);

        ObjectNode responseFormat = objectMapper.createObjectNode();
        responseFormat.put("type", "json_object");
        requestBody.set("response_format", responseFormat);

        ArrayNode messages = objectMapper.createArrayNode();
        ObjectNode userMessage = objectMapper.createObjectNode();
        userMessage.put("role", "user");

        ArrayNode content = objectMapper.createArrayNode();
        
        ObjectNode textContent = objectMapper.createObjectNode();
        textContent.put("type", "text");
        textContent.put("text", 
                "Bạn là hệ thống OCR tài chính. Phân tích hóa đơn trong ảnh và trả về ĐÚNG MỘT JSON OBJECT hợp lệ (không chứa text bên ngoài JSON).\n\n" +
                "Danh mục chi tiêu của người dùng (dùng đúng tên, phân biệt hoa thường):\n" +
                categoryListText + "\n\n" +
                "Quy tắc bắt buộc:\n" +
                "1. Trích xuất TẤT CẢ dòng sản phẩm/dịch vụ trong hóa đơn.\n" +
                "2. amount là số nguyên VND (VD: 45000). Nếu có số lượng và đơn giá, amount = số lượng x đơn giá.\n" +
                "3. BỎ QUA các dòng không phải sản phẩm (Tổng cộng, VAT, Giảm giá, Tiền thối...).\n" +
                "4. categoryName PHẢI thuộc danh sách ở trên.\n" +
                "5. receiptDate định dạng YYYY-MM-DD, hoặc null.\n" +
                "6. location là địa chỉ/tên chi nhánh ghi trên hóa đơn, hoặc null.\n" +
                "7. Trả về đúng định dạng JSON object sau:\n" +
                "{\n" +
                "  \"merchant\": \"Tên cửa hàng\",\n" +
                "  \"location\": \"Địa chỉ\",\n" +
                "  \"receiptDate\": \"YYYY-MM-DD\",\n" +
                "  \"items\": [\n" +
                "    {\n" +
                "      \"name\": \"Tên món\",\n" +
                "      \"amount\": 150000,\n" +
                "      \"categoryName\": \"Tên danh mục\"\n" +
                "    }\n" +
                "  ]\n" +
                "}");
        content.add(textContent);

        ObjectNode imageContent = objectMapper.createObjectNode();
        imageContent.put("type", "image_url");
        ObjectNode imageUrl = objectMapper.createObjectNode();
        String safeMimeType = mimeType != null ? mimeType : "image/jpeg";
        imageUrl.put("url", "data:" + safeMimeType + ";base64," + base64Image);
        imageContent.set("image_url", imageUrl);
        content.add(imageContent);

        userMessage.set("content", content);
        messages.add(userMessage);

        requestBody.set("messages", messages);

        return requestBody;
    }

    private String extractOpenAIOutputText(JsonNode responseBody) {
        if (responseBody == null) {
            return null;
        }

        JsonNode choices = responseBody.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            return null;
        }

        JsonNode message = choices.get(0).path("message");
        JsonNode content = message.get("content");
        if (content != null && !content.isNull()) {
            return content.asText().trim();
        }

        return null;
    }

    private String sanitizeJsonResponse(String rawText) {
        String cleaned = rawText.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceFirst("^```(?:json)?", "").replaceFirst("```$", "").trim();
        }
        return cleaned;
    }

    private BigDecimal parseAmount(JsonNode amountNode) {
        if (amountNode == null || amountNode.isNull()) {
            return BigDecimal.ZERO;
        }

        if (amountNode.isNumber()) {
            return amountNode.decimalValue();
        }

        String text = amountNode.asText("").replaceAll("[^\\d]", "").trim();
        if (text.isBlank()) {
            return BigDecimal.ZERO;
        }

        try {
            return new BigDecimal(text);
        } catch (NumberFormatException ignored) {
            return BigDecimal.ZERO;
        }
    }

    private LocalDate parseReceiptDate(String rawDate) {
        if (rawDate == null || rawDate.isBlank() || "null".equalsIgnoreCase(rawDate)) {
            return null;
        }
        try {
            return LocalDate.parse(rawDate.trim());
        } catch (Exception ignored) {
            return null;
        }
    }

    private CategoryEntity resolveCategory(List<CategoryEntity> categories, String categoryName, String itemName, CategoryEntity otherCategory) {
        if (!categoryName.isBlank()) {
            String normalized = normalize(categoryName);

            CategoryEntity exact = categories.stream()
                    .filter(c -> normalize(c.getName()).equals(normalized))
                    .findFirst()
                    .orElse(null);
            if (exact != null) return exact;

            CategoryEntity partial = categories.stream()
                    .filter(c -> normalized.contains(normalize(c.getName()))
                            || normalize(c.getName()).contains(normalized))
                    .findFirst()
                    .orElse(null);
            if (partial != null) return partial;
        }

        if (!itemName.isBlank()) {
            String normalizedItem = normalize(itemName);
            CategoryEntity byItem = categories.stream()
                    .filter(c -> normalizedItem.contains(normalize(c.getName()))
                            || normalize(c.getName()).contains(normalizedItem))
                    .findFirst()
                    .orElse(null);
            if (byItem != null) return byItem;
        }

        return otherCategory;
    }

    private CategoryEntity ensureOtherExpenseCategory(ProfileEntity profile, List<CategoryEntity> expenseCategories) {
        CategoryEntity existing = categoryRepository
                .findByNameIgnoreCaseAndTypeAndProfileId(OTHER_CATEGORY_NAME, EXPENSE_TYPE, profile.getId())
                .orElse(null);
        if (existing != null) {
            boolean alreadyIncluded = expenseCategories.stream().anyMatch(category -> Objects.equals(category.getId(), existing.getId()));
            if (!alreadyIncluded) {
                expenseCategories.add(existing);
            }
            return existing;
        }

        CategoryEntity created = categoryRepository.save(CategoryEntity.builder()
                .name(OTHER_CATEGORY_NAME)
                .type(EXPENSE_TYPE)
                .icon(OTHER_CATEGORY_ICON)
                .profile(profile)
                .build());
        expenseCategories.add(created);
        return created;
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        String decomposed = Normalizer.normalize(value, Normalizer.Form.NFD)
            .replaceAll("\\p{M}+", "");

        return decomposed.toLowerCase(Locale.ROOT)
                .replace("đ", "d")
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String safeText(String value) {
        return Objects.requireNonNullElse(value, "").trim();
    }
}
