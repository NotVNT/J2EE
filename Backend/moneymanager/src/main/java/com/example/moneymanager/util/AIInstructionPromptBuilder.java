package com.example.moneymanager.util;

import java.util.List;
import java.util.Map;

/**
 * Xây dựng system prompt cho AI intent parser (POST /ai/parse-intent).
 *
 * <p>Prompt được tách thành 4 phần rõ ràng:
 * <ol>
 *   <li>Vai trò và output contract — chỉ trả JSON thuần.</li>
 *   <li>Taxonomy intent — danh sách đầy đủ intent hợp lệ.</li>
 *   <li>Quy tắc map ngôn ngữ tự nhiên → intent (ưu tiên classifier-first).</li>
 *   <li>Few-shot examples — đặc biệt tập trung vào các case hay fail.</li>
 * </ol>
 *
 * <p>Lưu ý thiết kế: Không đưa yêu cầu markdown/tone vào prompt parse-intent;
 * những thứ đó chỉ nên nằm ở chat thường.
 */
public class AIInstructionPromptBuilder {

    // ─── Phần 1: Vai trò và output contract ──────────────────────────────────

    private static final String PART1_ROLE_AND_CONTRACT =
            "Bạn là Nova — bộ phân loại intent (intent classifier) của Money Manager.\n" +
            "Nhiệm vụ DUY NHẤT: phân tích yêu cầu người dùng và trả về JSON thuần.\n\n" +
            "OUTPUT CONTRACT (bắt buộc tuyệt đối):\n" +
            "• CHỈ trả về một JSON object. Không có text trước hoặc sau JSON.\n" +
            "• Bắt đầu bằng { và kết thúc bằng }.\n" +
            "• Mọi chuỗi trong JSON phải escape đúng chuẩn JSON.\n" +
            "• Không bao giờ từ chối bằng câu văn thường — nếu ngoài phạm vi, vẫn trả JSON với intent=INVALID_REQUEST.\n\n" +
            "SCHEMA JSON TRẢ VỀ:\n" +
            "{\n" +
            "  \"intent\": \"<tên intent>\",\n" +
            "  \"intentType\": \"ACTION\" | \"QUESTION\" | \"INVALID\",\n" +
            "  \"extractedFields\": { <các field đã trích xuất được> },\n" +
            "  \"missingFields\": [ <tên field bắt buộc còn thiếu> ],\n" +
            "  \"confidence\": <0.0 đến 1.0>,\n" +
            "  \"confirmationPrompt\": \"<câu xác nhận tiếng Việt thân thiện, chỉ có khi intentType=ACTION>\",\n" +
            "  \"answer\": \"<câu trả lời, chỉ có khi intentType=QUESTION>\",\n" +
            "  \"validationErrors\": [ <lý do nếu intentType=INVALID> ]\n" +
            "}\n";

    // ─── Phần 2: Taxonomy intent ──────────────────────────────────────────────

    private static final String PART2_TAXONOMY =
            "\nTAXONOMY INTENT (intentType=ACTION):\n" +
            "• Chi tiêu  : CREATE_EXPENSE, UPDATE_EXPENSE, DELETE_EXPENSE\n" +
            "• Thu nhập  : CREATE_INCOME, UPDATE_INCOME, DELETE_INCOME\n" +
            "• Danh mục  : CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY\n" +
            "• Ngân sách : CREATE_BUDGET, UPDATE_BUDGET, DELETE_BUDGET\n" +
            "• Mục tiêu  : CREATE_SAVING_GOAL, UPDATE_SAVING_GOAL, DELETE_SAVING_GOAL\n" +
            "• Hũ/Hủ    : CREATE_JAR, UPDATE_JAR, DELETE_JAR, TRANSFER_JAR\n" +
            "• Xuất file : EXPORT_EXCEL_INCOME, EXPORT_EXCEL_EXPENSE\n" +
            "• Email báo cáo: EMAIL_INCOME_REPORT, EMAIL_EXPENSE_REPORT\n\n" +
            "TAXONOMY INTENT (intentType=QUESTION):\n" +
            "• Hỏi thống kê, tra cứu thông tin tài chính: ANSWER_QUESTION\n\n" +
            "TAXONOMY INTENT (intentType=INVALID):\n" +
            "• Ngoài phạm vi tài chính (chính trị, y tế, v.v.): INVALID_REQUEST\n";

    // ─── Phần 3: Quy tắc map ngôn ngữ tự nhiên → intent ─────────────────────

    private static final String PART3_MAPPING_RULES =
            "\nQUY TẮC PHÂN LOẠI (áp dụng theo thứ tự ưu tiên):\n\n" +
            "A. PHÁT HIỆN LOẠI THAO TÁC (ưu tiên kiểm tra TRƯỚC khi xét domain):\n" +
            "  THÊM/TẠO: thêm, tạo, ghi, nhập, add, tao, them\n" +
            "  XÓA: xóa, bỏ, hủy, remove, xoa, bo\n" +
            "  SỬA/ĐỔI: sửa, chỉnh, đổi, cập nhật, update, sua, chinh, doi\n" +
            "  XUẤT: xuất, tải, download, export\n" +
            "  EMAIL: gửi mail, gửi email, gửi báo cáo qua email\n" +
            "  CHUYỂN: chuyển tiền, dời tiền, transfer\n" +
            "  HỎI: hỏi, xem, cho biết, bao nhiêu, tổng, thống kê, liệt kê, hiện\n\n" +
            "B. XÁC ĐỊNH DOMAIN (dùng pageContext nếu câu mơ hồ):\n" +
            "  Chi tiêu/expense: chi tiêu, chi, giao dịch, mua, tiêu, ăn, đi lại\n" +
            "  Thu nhập/income : thu nhập, thu, lương, income, thêm tiền vào\n" +
            "  Hũ/Hủ/jar      : hũ, hủ, jar (xử lý cả 2 cách viết tương đương)\n" +
            "  Ngân sách       : ngân sách, budget, hạn mức\n" +
            "  Mục tiêu        : mục tiêu, tiết kiệm, saving, goal\n" +
            "  Danh mục        : danh mục, category, loại\n\n" +
            "C. CÂU FOLLOW-UP NGẮN (resolve bằng pageContext + conversation history):\n" +
            "  'cái đó', 'cái vừa rồi', 'mục vừa nêu', 'cái 50k hôm nay'\n" +
            "  → Tìm entity trong recentExpenses/recentIncomes/jars theo amount+date\n" +
            "  'hũ này', 'hũ vừa rồi' → Tìm jarName từ jars context\n\n" +
            "D. XỬ LÝ DELETE — BẮT BUỘC:\n" +
            "  Khi phát hiện động từ XÓA + domain → PHẢI trả DELETE_xxx.\n" +
            "  Tìm id trong context (recentExpenses, recentIncomes, jars...) theo name/amount/date.\n" +
            "  Không bao giờ trả ANSWER_QUESTION cho câu có từ xóa rõ ràng.\n\n" +
            "E. EMAIL BÁO CÁO — PHÂN LOẠI THEO pageContext:\n" +
            "  pageContext='income' hoặc câu đề cập 'thu nhập' → EMAIL_INCOME_REPORT\n" +
            "  pageContext='expense' hoặc câu đề cập 'chi tiêu' → EMAIL_EXPENSE_REPORT\n" +
            "  pageContext='dashboard' hoặc câu chung chung → EMAIL_EXPENSE_REPORT (mặc định)\n" +
            "  'gửi mail giúp tôi', 'gửi mail báo cáo' → dùng pageContext để chọn loại\n\n" +
            "F. KHI INTENT LÀ ACTION NHƯNG THIẾU FIELD:\n" +
            "  KHÔNG hạ xuống ANSWER_QUESTION. Trả đúng intent ACTION.\n" +
            "  Điền missingFields với danh sách field bắt buộc còn thiếu.\n" +
            "  confidence = 0.6-0.8 (vì đã nhận diện intent nhưng thiếu data).\n\n" +
            "G. PHÂN BIỆT QUAN TRỌNG:\n" +
            "  'thu nhập/lương/income' → CREATE_INCOME (KHÔNG phải CREATE_EXPENSE)\n" +
            "  'chi tiêu/mua/tiêu' → CREATE_EXPENSE\n" +
            "  'đổi tên hũ X thành Y' → UPDATE_JAR với jarName=X, name=Y\n" +
            "  'chuyển tiền từ hũ A sang hũ B' → TRANSFER_JAR\n" +
            "  Câu chỉ hỏi thông tin (tổng chi, hôm nay tiêu bao nhiêu) → ANSWER_QUESTION\n\n" +
            "H. FORMAT FIELD BẮT BUỘC:\n" +
            "  date: YYYY-MM-DD\n" +
            "  amount, targetAmount, currentAmount: số nguyên (50000 không phải '50,000đ')\n" +
            "  Ngày hôm nay: %s\n";

    // ─── Phần 4: Few-shot examples ────────────────────────────────────────────

    private static final String PART4_FEW_SHOT =
            "\nFEW-SHOT EXAMPLES (ưu tiên các case hay fail):\n\n" +
            "--- Ví dụ 1: Dashboard + gửi mail báo cáo chung ---\n" +
            "pageContext: dashboard\n" +
            "User: \"gửi mail báo cáo giúp tôi\"\n" +
            "Trả về:\n" +
            "{\"intent\":\"EMAIL_EXPENSE_REPORT\",\"intentType\":\"ACTION\",\"extractedFields\":{},\"missingFields\":[],\"confidence\":0.85,\"confirmationPrompt\":\"Bạn muốn gửi báo cáo chi tiêu tháng này đến email của bạn?\"}\n\n" +
            "--- Ví dụ 2: Expense page + xóa giao dịch theo mô tả ---\n" +
            "pageContext: expense\n" +
            "recentExpenses: [{id:12, categoryName:'Ăn uống', amount:50000, date:'2026-05-29'}]\n" +
            "User: \"xóa giao dịch ăn sáng hôm nay\"\n" +
            "Trả về:\n" +
            "{\"intent\":\"DELETE_EXPENSE\",\"intentType\":\"ACTION\",\"extractedFields\":{\"expenseId\":12},\"missingFields\":[],\"confidence\":0.9,\"confirmationPrompt\":\"Bạn muốn xóa chi tiêu Ăn uống 50.000đ ngày 29/05?\"}\n\n" +
            "--- Ví dụ 3: Jars page + đổi tên hũ ---\n" +
            "pageContext: jars\n" +
            "jars: [{name:'Thiết yếu'}, {name:'Giải trí'}]\n" +
            "User: \"đổi tên hũ thiết yếu thành sinh hoạt\"\n" +
            "Trả về:\n" +
            "{\"intent\":\"UPDATE_JAR\",\"intentType\":\"ACTION\",\"extractedFields\":{\"jarName\":\"Thiết yếu\",\"name\":\"Sinh hoạt\"},\"missingFields\":[],\"confidence\":0.95,\"confirmationPrompt\":\"Bạn muốn đổi tên hũ \\\"Thiết yếu\\\" thành \\\"Sinh hoạt\\\"?\"}\n\n" +
            "--- Ví dụ 4: Income page + xuất file tháng này ---\n" +
            "pageContext: income\n" +
            "User: \"xuất file tháng này\"\n" +
            "Trả về:\n" +
            "{\"intent\":\"EXPORT_EXCEL_INCOME\",\"intentType\":\"ACTION\",\"extractedFields\":{},\"missingFields\":[],\"confidence\":0.9,\"confirmationPrompt\":\"Bạn muốn xuất báo cáo Excel thu nhập tháng này về máy?\"}\n\n" +
            "--- Ví dụ 5: Follow-up ngắn theo lịch sử ---\n" +
            "pageContext: expense\n" +
            "conversationHistory: [user:'thêm chi tiêu ăn trưa 50k hôm nay', assistant:'Đã tạo chi tiêu...']\n" +
            "User: \"cái vừa rồi sửa thành 80k\"\n" +
            "Trả về:\n" +
            "{\"intent\":\"UPDATE_EXPENSE\",\"intentType\":\"ACTION\",\"extractedFields\":{\"amount\":80000},\"missingFields\":[\"expenseId\"],\"confidence\":0.75,\"confirmationPrompt\":\"Bạn muốn sửa chi tiêu vừa tạo thành 80.000đ?\"}\n\n" +
            "--- Ví dụ 6: Câu không có đủ thông tin (action + missing fields) ---\n" +
            "pageContext: expense\n" +
            "User: \"thêm chi tiêu\"\n" +
            "Trả về:\n" +
            "{\"intent\":\"CREATE_EXPENSE\",\"intentType\":\"ACTION\",\"extractedFields\":{},\"missingFields\":[\"amount\",\"categoryName\",\"date\"],\"confidence\":0.7,\"confirmationPrompt\":\"Bạn muốn thêm chi tiêu. Bạn có thể cho mình biết số tiền, danh mục và ngày không?\"}\n\n" +
            "--- Ví dụ 7: Câu hỏi thuần thông tin ---\n" +
            "User: \"hôm nay tôi tiêu bao nhiêu?\"\n" +
            "Trả về:\n" +
            "{\"intent\":\"ANSWER_QUESTION\",\"intentType\":\"QUESTION\",\"extractedFields\":{},\"missingFields\":[],\"confidence\":0.95,\"answer\":\"<câu trả lời dựa trên dữ liệu context>\"}\n\n" +
            "--- Ví dụ 8: Ngoài phạm vi ---\n" +
            "User: \"ai là tổng thống Mỹ?\"\n" +
            "Trả về:\n" +
            "{\"intent\":\"INVALID_REQUEST\",\"intentType\":\"INVALID\",\"extractedFields\":{},\"missingFields\":[],\"confidence\":0.99,\"validationErrors\":[\"Câu hỏi ngoài phạm vi tài chính cá nhân của Money Manager.\"]}\n";

    // ─── Context hiện tại ─────────────────────────────────────────────────────

    private static final String PAGE_CONTEXT_TEMPLATE =
            "\nNGỮ CẢNH HIỆN TẠI:\n" +
            "Trang: %s\n" +
            "Dữ liệu người dùng: %s\n";

    private static final String PAGE_LABELS_VI =
            "dashboard: Tổng quan, income: Thu nhập, expense: Chi tiêu, " +
            "budget: Ngân sách, savingGoals: Mục tiêu tiết kiệm, " +
            "category: Danh mục, filter: Bộ lọc, forecast: Dự báo, reports: Báo cáo, jars: Hũ chi tiêu";

    /**
     * Xây dựng system prompt đầy đủ cho intent parsing với classifier-first structure.
     *
     * @param pageContext tên trang hiện tại (dashboard, expense, income, jars, ...)
     * @param pageData    dữ liệu trang đã load (expenses, incomes, jars, ...)
     * @return system prompt hoàn chỉnh
     */
    public static String buildSystemPrompt(String pageContext, Map<String, Object> pageData) {
        String today = java.time.LocalDate.now().toString();
        String pageLabel = getPageLabel(pageContext).replace("%", "%%");
        String dataSummary = summarizePageData(pageContext, pageData).replace("%", "%%");

        String part3WithDate = String.format(PART3_MAPPING_RULES, today);

        return PART1_ROLE_AND_CONTRACT
                + PART2_TAXONOMY
                + part3WithDate
                + PART4_FEW_SHOT
                + String.format(PAGE_CONTEXT_TEMPLATE, pageLabel, dataSummary);
    }

    /**
     * Prompt fallback đơn giản cho chat thường (không phải intent parsing).
     */
    public static String buildFallbackSystemPrompt() {
        return "Bạn là Nova, trợ lý AI đồng hành thân thiết của Money Manager. " +
                "Hỗ trợ tài chính cá nhân, tâm lý chi tiêu, hỗ trợ cảm xúc. " +
                "Trả lời bằng tiếng Việt, ấm áp và quan tâm, không phán xét, không cộc lốc. " +
                "Tối đa 200 chữ.";
    }

    private static String getPageLabel(String pageContext) {
        if (pageContext == null || pageContext.isBlank()) return "Tổng quan";
        return switch (pageContext.trim().toLowerCase()) {
            case "dashboard"   -> "Tổng quan";
            case "income"      -> "Thu nhập";
            case "expense"     -> "Chi tiêu";
            case "budget"      -> "Ngân sách";
            case "savinggoals" -> "Mục tiêu tiết kiệm";
            case "category"    -> "Danh mục";
            case "filter"      -> "Bộ lọc";
            case "forecast"    -> "Dự báo";
            case "reports"     -> "Báo cáo";
            case "jars"        -> "Hũ chi tiêu";
            default            -> "Tổng quan";
        };
    }

    @SuppressWarnings("unchecked")
    private static String summarizePageData(String pageContext, Map<String, Object> pageData) {
        if (pageData == null || pageData.isEmpty()) return "Chưa có dữ liệu trang.";

        StringBuilder sb = new StringBuilder();
        if (pageContext == null) pageContext = "";

        switch (pageContext.trim().toLowerCase()) {
            case "category" -> {
                if (pageData.containsKey("categories")) {
                    List<Map<String, Object>> cats = (List<Map<String, Object>>) pageData.get("categories");
                    sb.append(cats.size()).append(" danh mục: ");
                    for (int i = 0; i < Math.min(cats.size(), 10); i++) {
                        sb.append(cats.get(i).get("name"));
                        if (i < Math.min(cats.size(), 10) - 1) sb.append(", ");
                    }
                }
            }
            case "jars" -> {
                if (pageData.containsKey("jars")) {
                    List<Map<String, Object>> jars = (List<Map<String, Object>>) pageData.get("jars");
                    formatJarsSummary(jars, sb);
                }
            }
            case "expense" -> {
                if (pageData.containsKey("totalExpenseCount")) {
                    sb.append("Tổng số chi tiêu: ").append(pageData.get("totalExpenseCount")).append(" giao dịch");
                }
                if (pageData.containsKey("totalExpenseAmount")) {
                    sb.append(", tổng tiền: ").append(pageData.get("totalExpenseAmount")).append("đ");
                }
                if (pageData.containsKey("recentExpenses")) {
                    List<Map<String, Object>> expenses = (List<Map<String, Object>>) pageData.get("recentExpenses");
                    if (!expenses.isEmpty()) {
                        sb.append(" | Giao dịch gần nhất: ");
                        for (int i = 0; i < expenses.size(); i++) {
                            Map<String, Object> e = expenses.get(i);
                            sb.append(e.get("categoryName")).append(" ").append(e.get("amount")).append("đ")
                              .append(" (").append(e.get("date")).append(") [expenseId=").append(e.get("id")).append("]");
                            if (e.get("description") != null && !e.get("description").toString().isBlank()) {
                                sb.append("[desc=").append(e.get("description")).append("]");
                            }
                            if (e.get("jarName") != null && !e.get("jarName").toString().isBlank()) {
                                sb.append("[jarName=").append(e.get("jarName")).append("]");
                            }
                            if (i < expenses.size() - 1) sb.append(", ");
                        }
                    }
                }
                if (pageData.containsKey("categories")) {
                    List<Map<String, Object>> cats = (List<Map<String, Object>>) pageData.get("categories");
                    sb.append(" | Danh mục chi tiêu: ");
                    for (int i = 0; i < Math.min(cats.size(), 8); i++) {
                        sb.append(cats.get(i).get("name"));
                        if (i < Math.min(cats.size(), 8) - 1) sb.append(", ");
                    }
                }
            }
            case "income" -> {
                if (pageData.containsKey("totalIncomeCount")) {
                    sb.append("Tổng số thu nhập: ").append(pageData.get("totalIncomeCount")).append(" giao dịch");
                }
                if (pageData.containsKey("totalIncomeAmount")) {
                    sb.append(", tổng tiền: ").append(pageData.get("totalIncomeAmount")).append("đ");
                }
                if (pageData.containsKey("recentIncomes")) {
                    List<Map<String, Object>> incomes = (List<Map<String, Object>>) pageData.get("recentIncomes");
                    if (!incomes.isEmpty()) {
                        sb.append(" | Thu nhập gần nhất: ");
                        for (int i = 0; i < incomes.size(); i++) {
                            Map<String, Object> inc = incomes.get(i);
                            sb.append(inc.get("name")).append(" ").append(inc.get("amount")).append("đ")
                              .append(" (").append(inc.get("date")).append(") [incomeId=").append(inc.get("id")).append("]");
                            if (i < incomes.size() - 1) sb.append(", ");
                        }
                    }
                }
                if (pageData.containsKey("categories")) {
                    List<Map<String, Object>> cats = (List<Map<String, Object>>) pageData.get("categories");
                    sb.append(" | Danh mục thu nhập: ");
                    for (int i = 0; i < Math.min(cats.size(), 8); i++) {
                        sb.append(cats.get(i).get("name"));
                        if (i < Math.min(cats.size(), 8) - 1) sb.append(", ");
                    }
                }
            }
            case "budget" -> {
                if (pageData.containsKey("categories")) {
                    List<Map<String, Object>> cats = (List<Map<String, Object>>) pageData.get("categories");
                    sb.append("Danh mục: ");
                    for (int i = 0; i < Math.min(cats.size(), 10); i++) {
                        sb.append(cats.get(i).get("name"));
                        if (i < Math.min(cats.size(), 10) - 1) sb.append(", ");
                    }
                }
                if (pageData.containsKey("budgets")) {
                    List<Map<String, Object>> budgets = (List<Map<String, Object>>) pageData.get("budgets");
                    if (!budgets.isEmpty()) {
                        sb.append(" | Ngân sách hiện tại: ");
                        for (int i = 0; i < Math.min(budgets.size(), 5); i++) {
                            Map<String, Object> b = budgets.get(i);
                            sb.append(b.get("categoryName")).append("=").append(b.get("amount"))
                              .append("[budgetId=").append(b.get("id")).append("]");
                            if (i < Math.min(budgets.size(), 5) - 1) sb.append(", ");
                        }
                    }
                }
            }
            case "savinggoals" -> {
                if (pageData.containsKey("savingGoals")) {
                    List<Map<String, Object>> goals = (List<Map<String, Object>>) pageData.get("savingGoals");
                    sb.append(goals.size()).append(" mục tiêu tiết kiệm:");
                    for (int i = 0; i < Math.min(goals.size(), 10); i++) {
                        Map<String, Object> g = goals.get(i);
                        sb.append(" | ").append(g.get("name"))
                          .append(" [savingGoalId=").append(g.get("id")).append("]")
                          .append(": mục tiêu=").append(g.get("targetAmount")).append("đ")
                          .append(", đã có=").append(g.get("currentAmount")).append("đ")
                          .append(", còn thiếu=").append(g.get("remainingAmount")).append("đ")
                          .append(", tiến độ=").append(g.get("progressPercent")).append("%")
                          .append(", cần/tháng=").append(g.get("monthlyTarget")).append("đ")
                          .append(", đã đóng tháng này=").append(g.get("monthlyContributed")).append("đ")
                          .append(", hạn=").append(g.get("startDate")).append("→").append(g.get("targetDate"))
                          .append(", chậm tiến độ=").append(g.get("isBehindSchedule"));
                    }
                }
            }
            default -> {
                // Dashboard — tóm tắt tổng hợp
                if (pageData.containsKey("totalExpenseCount")) {
                    sb.append("Chi tiêu: ").append(pageData.get("totalExpenseCount")).append(" giao dịch, tổng ")
                      .append(pageData.get("totalExpenseAmount")).append("đ");
                }
                if (pageData.containsKey("totalIncomeCount")) {
                    sb.append(" | Thu nhập: ").append(pageData.get("totalIncomeCount")).append(" giao dịch, tổng ")
                      .append(pageData.get("totalIncomeAmount")).append("đ");
                }
                if (pageData.containsKey("recentExpenses")) {
                    List<Map<String, Object>> expenses = (List<Map<String, Object>>) pageData.get("recentExpenses");
                    if (!expenses.isEmpty()) {
                        sb.append(" | Chi tiêu gần nhất: ");
                        for (int i = 0; i < expenses.size(); i++) {
                            Map<String, Object> e = expenses.get(i);
                            sb.append(e.get("categoryName")).append(" ").append(e.get("amount")).append("đ")
                              .append(" (").append(e.get("date")).append(") [expenseId=").append(e.get("id")).append("]");
                            if (i < expenses.size() - 1) sb.append(", ");
                        }
                    }
                }
                if (pageData.containsKey("recentIncomes")) {
                    List<Map<String, Object>> incomes = (List<Map<String, Object>>) pageData.get("recentIncomes");
                    if (!incomes.isEmpty()) {
                        sb.append(" | Thu nhập gần nhất: ");
                        for (int i = 0; i < incomes.size(); i++) {
                            Map<String, Object> inc = incomes.get(i);
                            sb.append(inc.get("name")).append(" ").append(inc.get("amount")).append("đ")
                              .append(" (").append(inc.get("date")).append(") [incomeId=").append(inc.get("id")).append("]");
                            if (i < incomes.size() - 1) sb.append(", ");
                        }
                    }
                }
            }
        }

        // Luôn đính kèm jars context (trừ khi đang ở trang jars đã xử lý trên)
        if (!"jars".equals(pageContext.trim().toLowerCase()) && pageData.containsKey("jars")) {
            List<Map<String, Object>> jarsList = (List<Map<String, Object>>) pageData.get("jars");
            if (jarsList != null && !jarsList.isEmpty()) {
                sb.append(" | ");
                formatJarsSummary(jarsList, sb);
            }
        }

        return sb.length() > 0 ? sb.toString() : "Chưa có dữ liệu.";
    }

    @SuppressWarnings("unchecked")
    private static void formatJarsSummary(List<Map<String, Object>> jarsList, StringBuilder sb) {
        sb.append(jarsList.size()).append(" hũ/hủ chi tiêu: ");
        for (int i = 0; i < jarsList.size(); i++) {
            Map<String, Object> j = jarsList.get(i);
            sb.append(j.get("name"));
            sb.append(" [jarId=").append(j.get("id")).append("]");
            Object balance = j.get("currentBalance");
            Object pct = j.get("targetPercentage");
            sb.append("(số dư=").append(balance != null ? balance : 0).append("đ");
            sb.append(", phân bổ=").append(pct != null ? pct : 0).append("%");
            if (j.get("icon") != null && !j.get("icon").toString().isBlank()) {
                sb.append(", icon=").append(j.get("icon"));
            }
            sb.append(")");

            if (j.containsKey("recentExpenses")) {
                List<Map<String, Object>> jarRecent = (List<Map<String, Object>>) j.get("recentExpenses");
                if (jarRecent != null && !jarRecent.isEmpty()) {
                    sb.append("[giao dịch gần đây: ");
                    for (int k = 0; k < jarRecent.size(); k++) {
                        Map<String, Object> re = jarRecent.get(k);
                        sb.append(re.get("categoryName")).append(" ").append(re.get("amount")).append("đ")
                          .append(" (").append(re.get("date")).append(")");
                        if (k < jarRecent.size() - 1) sb.append(", ");
                    }
                    sb.append("]");
                } else {
                    sb.append("[chưa có giao dịch nào gần đây]");
                }
            }

            if (i < jarsList.size() - 1) sb.append(", ");
        }
    }
}
