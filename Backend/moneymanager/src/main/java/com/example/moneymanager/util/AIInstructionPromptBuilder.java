package com.example.moneymanager.util;

import java.util.List;
import java.util.Map;

public class AIInstructionPromptBuilder {

    private static final String BASE_SYSTEM_PROMPT =
            "\u26A0\uFE0F QUY T\u1EAEC TUY\u1EC6T \u0110\u1ED0I: M\u1ECDi ph\u1EA3n h\u1ED3i PH\u1EA2I l\u00E0 JSON THU\u1EA6N. TUY\u1EC6T \u0110\u1ED0I KH\u00D4NG tr\u1EA3 l\u1EDDi b\u1EB1ng v\u0103n b\u1EA3n th\u00F4ng th\u01B0\u1EDDng. " +
                    "B\u1EAFt \u0111\u1EA7u b\u1EB1ng { v\u00E0 k\u1EBFt th\u00FAc b\u1EB1ng }. Kh\u00F4ng c\u00F3 text n\u00E0o tr\u01B0\u1EDBc ho\u1EB7c sau JSON.\n\n" +
                    "B\u1EA1n l\u00E0 Nova, tr\u1EE3 l\u00FD AI c\u1EE7a Money Manager. B\u1EA1n C\u00D3 KH\u1EA2 N\u0102NG th\u1EF1c hi\u1EC7n \u0111\u1EA7y \u0111\u1EE7 CRUD.\n" +
                    "Trang hi\u1EC7n t\u1EA1i: %s\n" +
                    "D\u1EEF li\u1EC7u ng\u01B0\u1EDDi d\u00F9ng: %s\n\n" +
                    "DANH S\u00C1CH INTENT \u0110\u1EA6Y \u0110\u1EE6 (\u00E1p d\u1EE5ng t\u1EEB B\u1EA4T K\u1EF2 trang n\u00E0o):\n" +
                    "- Chi ti\u00EAu: CREATE_EXPENSE, UPDATE_EXPENSE, DELETE_EXPENSE\n" +
                    "- Thu nh\u1EADp: CREATE_INCOME, UPDATE_INCOME, DELETE_INCOME\n" +
                    "- Danh m\u1EE5c: CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY\n" +
                    "- Ng\u00E2n s\u00E1ch: CREATE_BUDGET, UPDATE_BUDGET, DELETE_BUDGET\n" +
                    "- M\u1EE5c ti\u00EAu ti\u1EBFt ki\u1EC7m: CREATE_SAVING_GOAL, UPDATE_SAVING_GOAL, DELETE_SAVING_GOAL\n" +
                    "- H\u0169 chi ti\u00EAu: CREATE_JAR, UPDATE_JAR, DELETE_JAR, TRANSFER_JAR\n" +
                    "- Xu\u1EA5t file Excel: EXPORT_EXCEL_INCOME (thu nh\u1EADp), EXPORT_EXCEL_EXPENSE (chi ti\u00EAu)\n" +
                    "- G\u1EEDi email b\u00E1o c\u00E1o: EMAIL_INCOME_REPORT (thu nh\u1EADp), EMAIL_EXPENSE_REPORT (chi ti\u00EAu)\n" +
                    "- C\u00E2u h\u1ECFi th\u00F4ng th\u01B0\u1EDDng: ANSWER_QUESTION\n\n" +
                    "QUY T\u1EAEC B\u1EAET BU\u1ED8C:\n" +
                    "1. Khi user mu\u1ED1n X\u00D3A (x\u00F3a/delete/b\u1ECF/h\u1EE7y giao d\u1ECBch): B\u1EAET BU\u1ED8C return DELETE_xxx intent. TUY\u1EC6T \u0110\u1ED0I KH\u00D4NG tr\u1EA3 l\u1EDDi 'kh\u00F4ng th\u1EC3 th\u1EF1c hi\u1EC7n'.\n" +
                    "2. Khi user mu\u1ED1n T\u1EA0O: return CREATE_xxx intent.\n" +
                    "3. Khi user mu\u1ED1n S\u1EECA: return UPDATE_xxx intent.\n" +
                    "4. Khi user mu\u1ED1n XU\u1EA4T EXCEL (xu\u1EA5t/t\u1EA3i/download b\u00E1o c\u00E1o excel/file thu nh\u1EADp/chi ti\u00EAu): return EXPORT_EXCEL_INCOME ho\u1EB7c EXPORT_EXCEL_EXPENSE.\n" +
                    "5. Khi user mu\u1ED1n G\u1EECI EMAIL B\u00C1O C\u00C1O (g\u1EEDi email/b\u00E1o c\u00E1o qua email thu nh\u1EADp/chi ti\u00EAu): return EMAIL_INCOME_REPORT ho\u1EB7c EMAIL_EXPENSE_REPORT.\n" +
                    "6. Ch\u1EC9 d\u00F9ng ANSWER_QUESTION khi user h\u1ECFi th\u00F4ng tin/th\u1ED1ng k\u00EA, kh\u00F4ng ph\u1EA3i thao t\u00E1c.\n" +
                    "7. INVALID_REQUEST ch\u1EC9 d\u00F9ng cho y\u00EAu c\u1EA7u phi t\u00E0i ch\u00EDnh (ch\u00EDnh tr\u1ECB, y t\u1EBF, v.v.).\n\n" +
                    "C\u00C1CH X\u1EEC L\u00DD X\u00D3A (DELETE):\n" +
                    "- T\u00ECm id c\u1EE7a record trong d\u1EEF li\u1EC7u ng\u1EEF c\u1EA3nh (recentExpenses, recentIncomes, budgets, savingGoals, jars)\n" +
                    "- Kh\u1EDBp theo name + amount + date \u0111\u1EC3 x\u00E1c \u0111\u1ECBnh \u0111\u00FAng record\n" +
                    "- Return: {\"intent\": \"DELETE_INCOME\", \"incomeId\": <id>, \"confirmationPrompt\": \"...\"}\n" +
                    "- Cho DELETE_EXPENSE: d\u00F9ng key 'expenseId'; DELETE_INCOME: 'incomeId'; DELETE_BUDGET: 'budgetId'; DELETE_SAVING_GOAL: 'savingGoalId'; DELETE_CATEGORY: 'categoryId'; DELETE_JAR: 'jarName'\n\n" +
                    "FORMAT RESPONSE (ch\u1EC9 JSON thu\u1EA7n, kh\u00F4ng c\u00F3 text ngo\u00E0i):\n" +
                    "CREATE_EXPENSE: {\"intent\": \"CREATE_EXPENSE\", \"amount\": 50000, \"categoryName\": \"\u0102n u\u1ED1ng\", \"date\": \"2026-05-14\", \"description\": \"\u0103n tr\u01B0a\", \"jarName\": \"V\u00ED t\u1ED5ng\", \"confirmationPrompt\": \"...\"}\n" +
                    "UPDATE_EXPENSE: {\"intent\": \"UPDATE_EXPENSE\", \"expenseId\": 123, \"amount\": 200000, \"categoryName\": \"Chi ti\u00EAu\", \"date\": \"2026-05-14\", \"confirmationPrompt\": \"S\u1EEDa chi ti\u00EAu #123 th\u00E0nh 200.000\u0111?\"}\n" +
                    "DELETE_EXPENSE: {\"intent\": \"DELETE_EXPENSE\", \"expenseId\": 123, \"confirmationPrompt\": \"X\u00F3a chi ti\u00EAu 120.000\u0111 ng\u00E0y 14/05?\"}\n" +
                    "CREATE_INCOME: {\"intent\": \"CREATE_INCOME\", \"amount\": 5000000, \"categoryName\": \"L\u01B0\u01A1ng\", \"date\": \"2026-05-14\", \"description\": \"l\u01B0\u01A1ng th\u00E1ng 5\", \"confirmationPrompt\": \"...\"}\n" +
                    "UPDATE_INCOME: {\"intent\": \"UPDATE_INCOME\", \"incomeId\": 456, \"amount\": 6000000, \"categoryName\": \"L\u01B0\u01A1ng\", \"date\": \"2026-05-14\", \"confirmationPrompt\": \"S\u1EEDa thu nh\u1EADp #456 th\u00E0nh 6.000.000\u0111?\"}\n" +
                    "DELETE_INCOME: {\"intent\": \"DELETE_INCOME\", \"incomeId\": 456, \"confirmationPrompt\": \"X\u00F3a thu nh\u1EADp 5.000.000\u0111 ng\u00E0y 14/05?\"}\n" +
                    "CREATE_SAVING_GOAL: {\"intent\": \"CREATE_SAVING_GOAL\", \"name\": \"Mua xe m\u00E1y\", \"targetAmount\": 30000000, \"currentAmount\": 0, \"confirmationPrompt\": \"...\"}\n" +
                    "CREATE_JAR: {\"intent\": \"CREATE_JAR\", \"name\": \"Gi\u1EA3i tr\u00ED\", \"targetPercentage\": 20, \"icon\": \"\uD83C\uDFAE\", \"color\": \"#FF5733\", \"confirmationPrompt\": \"...\"}\n" +
                    "UPDATE_JAR: {\"intent\": \"UPDATE_JAR\", \"jarName\": \"Gi\u1EA3i tr\u00ED\", \"name\": \"Games\", \"targetPercentage\": 25, \"confirmationPrompt\": \"...\"}\n" +
                    "DELETE_JAR: {\"intent\": \"DELETE_JAR\", \"jarName\": \"Gi\u1EA3i tr\u00ED\", \"confirmationPrompt\": \"X\u00F3a h\u0169 Gi\u1EA3i tr\u00ED?\"}\n" +
                    "TRANSFER_JAR: {\"intent\": \"TRANSFER_JAR\", \"fromJarName\": \"Ti\u1EBFt ki\u1EC7m\", \"toJarName\": \"Gi\u1EA3i tr\u00ED\", \"amount\": 500000, \"confirmationPrompt\": \"Chuy\u1EC3n 500.000\u0111 t\u1EEB Ti\u1EBFt ki\u1EC7m sang Gi\u1EA3i tr\u00ED?\"}\n" +
                    "Xu\u1EA5t Excel thu nh\u1EADp: {\"intent\": \"EXPORT_EXCEL_INCOME\", \"confirmationPrompt\": \"Xu\u1EA5t b\u00E1o c\u00E1o Excel thu nh\u1EADp th\u00E1ng n\u00E0y v\u1EC1 m\u00E1y b\u1EA1n?\"}\n" +
                    "Xu\u1EA5t Excel chi ti\u00EAu: {\"intent\": \"EXPORT_EXCEL_EXPENSE\", \"confirmationPrompt\": \"Xu\u1EA5t b\u00E1o c\u00E1o Excel chi ti\u00EAu th\u00E1ng n\u00E0y v\u1EC1 m\u00E1y b\u1EA1n?\"}\n" +
                    "G\u1EEDi email thu nh\u1EADp: {\"intent\": \"EMAIL_INCOME_REPORT\", \"confirmationPrompt\": \"G\u1EEDi b\u00E1o c\u00E1o thu nh\u1EADp th\u00E1ng n\u00E0y \u0111\u1EBFn email c\u1EE7a b\u1EA1n?\"}\n" +
                    "G\u1EEDi email chi ti\u00EAu: {\"intent\": \"EMAIL_EXPENSE_REPORT\", \"confirmationPrompt\": \"G\u1EEDi b\u00E1o c\u00E1o chi ti\u00EAu th\u00E1ng n\u00E0y \u0111\u1EBFn email c\u1EE7a b\u1EA1n?\"}\n" +
                    "C\u00E2u h\u1ECFi: {\"intent\": \"ANSWER_QUESTION\", \"answer\": \"...\"}\n" +
                    "Ngo\u00E0i ph\u1EA1m vi: {\"intent\": \"INVALID_REQUEST\", \"validationErrors\": [\"l\u00FD do\"]}\n\n" +
                    "PH\u00C2N BI\u1EC6T QUAN TR\u1ECCNG:\n" +
                    "- 's\u1EEDa/ch\u1EC9nh/\u0111\u1ED5i/c\u1EADp nh\u1EADt chi ti\u00EAu/giao d\u1ECBch' \u2192 UPDATE_EXPENSE (PH\u1EA2I c\u00F3 expenseId t\u1EEB recentExpenses)\n" +
                    "- 'x\u00F3a/b\u1ECF/h\u1EE7y chi ti\u00EAu/giao d\u1ECBch' \u2192 DELETE_EXPENSE (PH\u1EA2I c\u00F3 expenseId t\u1EEB recentExpenses)\n" +
                    "- 's\u1EEDa/ch\u1EC9nh thu nh\u1EADp' \u2192 UPDATE_INCOME (PH\u1EA2I c\u00F3 incomeId t\u1EEB recentIncomes)\n" +
                    "- 'x\u00F3a thu nh\u1EADp' \u2192 DELETE_INCOME (PH\u1EA2I c\u00F3 incomeId t\u1EEB recentIncomes)\n" +
                    "- 'thu nh\u1EADp/l\u01B0\u01A1ng/income' \u2192 CREATE_INCOME (KH\u00D4NG PH\u1EA2I CREATE_EXPENSE)\n" +
                    "- 'chi ti\u00EAu/mua/ti\u00EAu/expense' \u2192 CREATE_EXPENSE\n" +
                    "- 't\u1EA1o h\u0169/th\u00EAm h\u0169/jar' \u2192 CREATE_JAR (ph\u1EA3i c\u00F3 name, c\u00F3 th\u1EC3 c\u00F3 targetPercentage, icon)\n" +
                    "- 's\u1EEDa h\u0169/\u0111\u1ED5i t\u00EAn h\u0169' \u2192 UPDATE_JAR (ph\u1EA3i c\u00F3 jarName l\u00E0 t\u00EAn hi\u1EC7n t\u1EA1i c\u1EE7a h\u0169)\n" +
                    "- 'x\u00F3a h\u0169' \u2192 DELETE_JAR (ph\u1EA3i c\u00F3 jarName l\u00E0 t\u00EAn h\u0169 mu\u1ED1n x\u00F3a)\n" +
                    "- 'chuy\u1EC3n ti\u1EC1n/d\u1EDDi ti\u1EC1n/transfer t\u1EEB h\u0169...sang...' \u2192 TRANSFER_JAR (ph\u1EA3i c\u00F3 fromJarName, toJarName, amount)\n" +
                    "- 'g\u1EEDi email b\u00E1o c\u00E1o chi ti\u00EAu/t\u00E0i ch\u00EDnh/expense' \u2192 EMAIL_EXPENSE_REPORT\n" +
                    "- 'g\u1EEDi email b\u00E1o c\u00E1o thu nh\u1EADp/income' \u2192 EMAIL_INCOME_REPORT\n" +
                    "- 'xu\u1EA5t excel chi ti\u00EAu/t\u00E0i ch\u00EDnh' \u2192 EXPORT_EXCEL_EXPENSE\n" +
                    "- 'xu\u1EA5t excel thu nh\u1EADp' \u2192 EXPORT_EXCEL_INCOME\n" +
                    "\u0110\u1ECBnh d\u1EA1ng: date=YYYY-MM-DD, amount=s\u1ED1 kh\u00F4ng c\u00F3 k\u00FD hi\u1EC7u (50000 kh\u00F4ng ph\u1EA3i '50,000\u0111'), targetAmount=s\u1ED1 nguy\u00EAn.\n\n" +
                    "TONE CHO NG\u01AF\u1EDCI D\u00D9NG: C\u00E1c field confirmationPrompt, answer (trong ANSWER_QUESTION) v\u00E0 validationErrors ph\u1EA3i th\u00E2n thi\u1EC7n, l\u1ECBch s\u1EF1, g\u1EA7n g\u0169i. D\u00F9ng 'b\u1EA1n'. Kh\u00F4ng \u0111\u01B0\u1EE3c c\u1ED9c l\u1ED1c hay l\u1EA1nh l\u00F9ng. V\u00ED d\u1EE5 t\u1ED1t: 'B\u1EA1n c\u00F3 mu\u1ED1n th\u00EAm chi ti\u00EAu \u0102n u\u1ED1ng 50.000\u0111 h\u00F4m nay kh\u00F4ng?' \u2014 V\u00ED d\u1EE5 x\u1EA5u: 'Th\u00EAm chi ti\u00EAu.'.\n\n" +
                    "\uD83D\uDD34 NH\u1EAEC L\u1EA0I: Ch\u1EC9 tr\u1EA3 v\u1EC1 JSON. Kh\u00F4ng c\u00F3 l\u1EDDi gi\u1EA3i th\u00EDch, kh\u00F4ng c\u00F3 text ngo\u00E0i JSON. B\u1EAFt \u0111\u1EA7u { k\u1EBFt th\u00FAc }.";

    private static final String PAGE_LABELS_VI =
            "dashboard: T\u1ED5ng quan, income: Thu nh\u1EADp, expense: Chi ti\u00EAu, " +
                    "budget: Ng\u00E2n s\u00E1ch, savingGoals: M\u1EE5c ti\u00EAu ti\u1EBFt ki\u1EC7m, " +
                    "category: Danh m\u1EE5c, filter: B\u1ED9 l\u1ECDc, forecast: D\u1EF1 b\u00E1o, reports: B\u00E1o c\u00E1o, jars: H\u0169 chi ti\u00EAu";

    public static String buildSystemPrompt(String pageContext, Map<String, Object> pageData) {
        String pageLabel = getPageLabel(pageContext).replace("%", "%%");
        String dataSummary = summarizePageData(pageContext, pageData).replace("%", "%%");
        return String.format(BASE_SYSTEM_PROMPT, pageLabel, dataSummary);
    }

    public static String buildFallbackSystemPrompt() {
        return "B\u1EA1n l\u00E0 Nova, tr\u1EE3 l\u00FD AI \u0111\u1ED3ng h\u00E0nh th\u00E2n thi\u1EBFt c\u1EE7a Money Manager. " +
                "H\u1ED7 tr\u1EE3 t\u00E0i ch\u00EDnh c\u00E1 nh\u00E2n, t\u00E2m l\u00FD chi ti\u00EAu, h\u1ED7 tr\u1EE3 c\u1EA3m x\u00FAc. " +
                "Tr\u1EA3 l\u1EDDi b\u1EB1ng ti\u1EBFng Vi\u1EC7t, \u1EA5m \u00E1p v\u00E0 quan t\u00E2m, kh\u00F4ng ph\u00E1n x\u00E9t, kh\u00F4ng c\u1ED9c l\u1ED1c. " +
                "T\u1ED1i \u0111a 200 ch\u1EEF.";
    }

    private static String getPageLabel(String pageContext) {
        if (pageContext == null || pageContext.isBlank()) return "T\u1ED5ng quan";
        return switch (pageContext.trim().toLowerCase()) {
            case "dashboard" -> "T\u1ED5ng quan";
            case "income" -> "Thu nh\u1EADp";
            case "expense" -> "Chi ti\u00EAu";
            case "budget" -> "Ng\u00E2n s\u00E1ch";
            case "savinggoals" -> "M\u1EE5c ti\u00EAu ti\u1EBFt ki\u1EC7m";
            case "category" -> "Danh m\u1EE5c";
            case "filter" -> "B\u1ED9 l\u1ECDc";
            case "forecast" -> "D\u1EF1 b\u00E1o";
            case "reports" -> "B\u00E1o c\u00E1o";
            case "jars" -> "H\u0169 chi ti\u00EAu";
            default -> "T\u1ED5ng quan";
        };
    }

    @SuppressWarnings("unchecked")
    private static String summarizePageData(String pageContext, Map<String, Object> pageData) {
        if (pageData == null || pageData.isEmpty()) return "Ch\u01B0a c\u00F3 d\u1EEF li\u1EC7u trang.";

        StringBuilder sb = new StringBuilder();
        if (pageContext == null) pageContext = "";

        switch (pageContext.trim().toLowerCase()) {
            case "category" -> {
                if (pageData.containsKey("categories")) {
                    List<Map<String, Object>> cats = (List<Map<String, Object>>) pageData.get("categories");
                    sb.append(cats.size()).append(" danh m\u1EE5c: ");
                    for (int i = 0; i < Math.min(cats.size(), 10); i++) {
                        sb.append(cats.get(i).get("name"));
                        if (i < Math.min(cats.size(), 10) - 1) sb.append(", ");
                    }
                }
            }
            case "jars" -> {
                if (pageData.containsKey("jars")) {
                    List<Map<String, Object>> jars = (List<Map<String, Object>>) pageData.get("jars");
                    sb.append(jars.size()).append(" h\u0169: ");
                    for (int i = 0; i < Math.min(jars.size(), 10); i++) {
                        Map<String, Object> j = jars.get(i);
                        sb.append(j.get("name"));
                        sb.append(" [jarId=").append(j.get("id")).append("]");
                        Object balance = j.get("currentBalance");
                        Object pct = j.get("targetPercentage");
                        sb.append("(s\u1ED1 d\u01B0=").append(balance != null ? balance : 0).append("\u0111");
                        sb.append(", ph\u00E2n b\u1ED5=").append(pct != null ? pct : 0).append("%");
                        if (j.get("icon") != null && !j.get("icon").toString().isBlank()) {
                            sb.append(", icon=").append(j.get("icon"));
                        }
                        sb.append(")");
                        if (i < Math.min(jars.size(), 10) - 1) sb.append(", ");
                    }
                }
            }
            case "expense" -> {
                if (pageData.containsKey("totalExpenseCount")) {
                    sb.append("T\u1ED5ng s\u1ED1 chi ti\u00EAu: ").append(pageData.get("totalExpenseCount")).append(" giao d\u1ECBch");
                }
                if (pageData.containsKey("totalExpenseAmount")) {
                    sb.append(", t\u1ED5ng ti\u1EC1n: ").append(pageData.get("totalExpenseAmount")).append("\u0111");
                }
                if (pageData.containsKey("recentExpenses")) {
                    List<Map<String, Object>> expenses = (List<Map<String, Object>>) pageData.get("recentExpenses");
                    if (!expenses.isEmpty()) {
                        sb.append(" | 5 chi ti\u00EAu g\u1EA7n nh\u1EA5t: ");
                        for (int i = 0; i < expenses.size(); i++) {
                            Map<String, Object> e = expenses.get(i);
                            sb.append(e.get("categoryName")).append(" ").append(e.get("amount")).append("\u0111 (").append(e.get("date")).append(") [expenseId=").append(e.get("id")).append("]");
                            if (e.get("jarName") != null && !e.get("jarName").toString().isBlank()) {
                                sb.append("[jarName=").append(e.get("jarName")).append("]");
                            }
                            if (i < expenses.size() - 1) sb.append(", ");
                        }
                    }
                }
                if (pageData.containsKey("categories")) {
                    List<Map<String, Object>> cats = (List<Map<String, Object>>) pageData.get("categories");
                    sb.append(" | Danh m\u1EE5c: ");
                    for (int i = 0; i < Math.min(cats.size(), 8); i++) {
                        sb.append(cats.get(i).get("name"));
                        if (i < Math.min(cats.size(), 8) - 1) sb.append(", ");
                    }
                }
            }
            case "income" -> {
                if (pageData.containsKey("totalIncomeCount")) {
                    sb.append("T\u1ED5ng s\u1ED1 thu nh\u1EADp: ").append(pageData.get("totalIncomeCount")).append(" giao d\u1ECBch");
                }
                if (pageData.containsKey("totalIncomeAmount")) {
                    sb.append(", t\u1ED5ng ti\u1EC1n: ").append(pageData.get("totalIncomeAmount")).append("\u0111");
                }
                if (pageData.containsKey("recentIncomes")) {
                    List<Map<String, Object>> incomes = (List<Map<String, Object>>) pageData.get("recentIncomes");
                    if (!incomes.isEmpty()) {
                        sb.append(" | 5 thu nh\u1EADp g\u1EA7n nh\u1EA5t: ");
                        for (int i = 0; i < incomes.size(); i++) {
                            Map<String, Object> inc = incomes.get(i);
                            sb.append(inc.get("name")).append(" ").append(inc.get("amount")).append("\u0111 (").append(inc.get("date")).append(") [incomeId=").append(inc.get("id")).append("]");
                            if (i < incomes.size() - 1) sb.append(", ");
                        }
                    }
                }
                if (pageData.containsKey("categories")) {
                    List<Map<String, Object>> cats = (List<Map<String, Object>>) pageData.get("categories");
                    sb.append(" | Danh m\u1EE5c: ");
                    for (int i = 0; i < Math.min(cats.size(), 8); i++) {
                        sb.append(cats.get(i).get("name"));
                        if (i < Math.min(cats.size(), 8) - 1) sb.append(", ");
                    }
                }
            }
            case "budget" -> {
                if (pageData.containsKey("categories")) {
                    List<Map<String, Object>> cats = (List<Map<String, Object>>) pageData.get("categories");
                    sb.append("Danh m\u1EE5c: ");
                    for (int i = 0; i < Math.min(cats.size(), 10); i++) {
                        sb.append(cats.get(i).get("name"));
                        if (i < Math.min(cats.size(), 10) - 1) sb.append(", ");
                    }
                }
                if (pageData.containsKey("budgets")) {
                    List<Map<String, Object>> budgets = (List<Map<String, Object>>) pageData.get("budgets");
                    if (!budgets.isEmpty()) {
                        sb.append(" | Ng\u00E2n s\u00E1ch hi\u1EC7n t\u1EA1i: ");
                        for (int i = 0; i < Math.min(budgets.size(), 5); i++) {
                            Map<String, Object> b = budgets.get(i);
                            sb.append(b.get("categoryName")).append("=").append(b.get("amount"));
                            if (i < Math.min(budgets.size(), 5) - 1) sb.append(", ");
                        }
                    }
                }
            }
            case "savinggoals" -> {
                if (pageData.containsKey("savingGoals")) {
                    List<Map<String, Object>> goals = (List<Map<String, Object>>) pageData.get("savingGoals");
                    sb.append(goals.size()).append(" m\u1EE5c ti\u00EAu ti\u1EBFt ki\u1EC7m:");
                    for (int i = 0; i < Math.min(goals.size(), 10); i++) {
                        Map<String, Object> g = goals.get(i);
                        sb.append(" | ").append(g.get("name"))
                          .append(" [savingGoalId=").append(g.get("id")).append("]")
                          .append(": m\u1EE5c ti\u00EAu=").append(g.get("targetAmount")).append("\u0111")
                          .append(", \u0111\u00E3 c\u00F3=").append(g.get("currentAmount")).append("\u0111")
                          .append(", c\u00F2n thi\u1EBFu=").append(g.get("remainingAmount")).append("\u0111")
                          .append(", ti\u1EBFn \u0111\u1ED9=").append(g.get("progressPercent")).append("%")
                          .append(", c\u1EA7n/th\u00E1ng=").append(g.get("monthlyTarget")).append("\u0111")
                          .append(", \u0111\u00E3 \u0111\u00F3ng th\u00E1ng n\u00E0y=").append(g.get("monthlyContributed")).append("\u0111")
                          .append(", h\u1EA1n=").append(g.get("startDate")).append("\u2192").append(g.get("targetDate"))
                          .append(", ch\u1EADm ti\u1EBFn \u0111\u1ED9=").append(g.get("isBehindSchedule"));
                    }
                }
            }
            default -> {
                // Dashboard summary
                if (pageData.containsKey("totalExpenseCount")) {
                    sb.append("Chi ti\u00EAu: ").append(pageData.get("totalExpenseCount")).append(" giao d\u1ECBch, t\u1ED5ng ").append(pageData.get("totalExpenseAmount")).append("\u0111");
                }
                if (pageData.containsKey("totalIncomeCount")) {
                    sb.append(" | Thu nh\u1EADp: ").append(pageData.get("totalIncomeCount")).append(" giao d\u1ECBch, t\u1ED5ng ").append(pageData.get("totalIncomeAmount")).append("\u0111");
                }
                if (pageData.containsKey("recentExpenses")) {
                    List<Map<String, Object>> expenses = (List<Map<String, Object>>) pageData.get("recentExpenses");
                    if (!expenses.isEmpty()) {
                        sb.append(" | 5 chi ti\u00EAu g\u1EA7n nh\u1EA5t: ");
                        for (int i = 0; i < expenses.size(); i++) {
                            Map<String, Object> e = expenses.get(i);
                            sb.append(e.get("categoryName")).append(" ").append(e.get("amount")).append("\u0111 (").append(e.get("date")).append(") [expenseId=").append(e.get("id")).append("]");
                            if (i < expenses.size() - 1) sb.append(", ");
                        }
                    }
                }
                if (pageData.containsKey("recentIncomes")) {
                    List<Map<String, Object>> incomes = (List<Map<String, Object>>) pageData.get("recentIncomes");
                    if (!incomes.isEmpty()) {
                        sb.append(" | 5 thu nh\u1EADp g\u1EA7n nh\u1EA5t: ");
                        for (int i = 0; i < incomes.size(); i++) {
                            Map<String, Object> inc = incomes.get(i);
                            sb.append(inc.get("name")).append(" ").append(inc.get("amount")).append("\u0111 (").append(inc.get("date")).append(") [incomeId=").append(inc.get("id")).append("]");
                            if (i < incomes.size() - 1) sb.append(", ");
                        }
                    }
                }
            }
        }
        return sb.length() > 0 ? sb.toString() : "Ch\u01B0a c\u00F3 d\u1EEF li\u1EC7u.";
    }
}
