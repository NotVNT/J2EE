package com.example.moneymanager.util;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Utility bảo vệ AI pipeline khỏi prompt injection, nội dung độc hại và output không an toàn.
 */
public final class AIContentGuard {

    private static final Pattern INJECTION_PATTERN = Pattern.compile(
            "(?i)(ignore|forget|disregard|override|bypass).{0,30}(instruction|above|previous|system|prompt|rule)|"
                    + "(?i)(you are now|act as|pretend to be|roleplay as|simulate|impersonate)|"
                    + "(?i)(developer mode|jailbreak|dan mode|stan mode|evil mode|no restriction|unlimited mode)|"
                    + "(?i)(end of system|</system>|\\[SYSTEM\\]|\\[INST\\]|<\\|im_start\\|>)|"
                    + "(?i)(bo qua|xoa bo|quen di|hay quen).{0,30}(huong dan|system|prompt|lenh|quy tac|rang buoc)|"
                    + "(?i)(tu bay gio|bay gio ban|tu luc nay).{0,20}(la|khong con|hay dong|hanh dong nhu)|"
                    + "(?i)(dong vai|gia vo|gia lam|hay la|tro thanh).{0,20}(ai|robot|bot|tro ly|khong gioi han)|"
                    + "(?i)(khong con la|khong phai nova|khong phai ai|thoat khoi|vuot qua).{0,20}(gioi han|rang buoc|quy tac)|"
                    + "(?i)(repeat|lap lai|hien thi|show me|print|xuat ra).{0,30}(system prompt|huong dan he thong|toan bo lenh)|"
                    + "(?i)(what (are|is) your (instruction|system|prompt|rule))|"
                    + "(?i)(---\\s*(end|stop|new|begin|system|instruction))|"
                    + "(?i)(#{3,}\\s*(system|end|override))",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    private static final List<String> POLITICAL_KEYWORDS = List.of(
            "chinh tri", "chinh sach", "dang phai", "bau cu", "tong thong", "thu tuong",
            "quoc hoi", "chinh phu", "phan doi", "dem chu", "cong san", "tu ban",
            "cuoc chien", "chien tranh", "bieu tinh", "noi loan", "cach mang",
            "chu tich nuoc", "chu tich quoc hoi", "bo truong", "lanh dao nha nuoc",
            "politik", "election", "president", "government", "communist", "democracy"
    );

    private static final List<String> MEDICAL_DIAGNOSIS_KEYWORDS = List.of(
            "chuan doan", "benh gi", "trieu chung", "thuoc gi", "uong thuoc",
            "bac si", "kham benh", "dau bung", "dau dau", "sot cao",
            "ung thu", "tieu duong", "tim mach", "than kinh", "tam than",
            "covid", "virus", "vaccine", "diagnose", "symptom", "prescription", "medication"
    );

    private static final List<String> SELF_HARM_KEYWORDS = List.of(
            "tu tu", "tu sat", "tu lam hai", "chet di", "khong muon song",
            "ket thuc tat ca", "khu sinh", "benh vien tam than", "suicide",
            "self harm", "end my life", "kill myself"
    );

    private static final List<String> SEXUAL_CONTENT_KEYWORDS = List.of(
            "khieu dam", "phim sex", "phim nguoi lon", "noi dung 18+", "noi dung nguoi lon",
            "quan he tinh duc", "lam tinh", "goi duc", "hiep dam", "xam hai tinh duc",
            "thoat y", "khoa than", "dam duc", "dien vien nguoi lon", "trang web sex",
            "roleplay tinh cam", "chat sex", "truyen nguoi lon", "anh nong", "video nong",
            "clip nong", "ga tinh", "tre vi thanh nien", "duoi 18", "sugar baby",
            "porn", "pornography", "xxx", "nude", "nsfw", "onlyfans",
            "sexual roleplay", "erotic", "hentai", "adult content", "explicit content",
            "rape", "molest", "sexual assault", "sex chat"
    );

    private static final List<String> VIOLENCE_HATE_KEYWORDS = List.of(
            "giet nguoi", "hanh hung", "tra tan", "danh bom", "dat bom", "vu khi",
            "pha hoai", "bao luc", "ky thi chung toc", "phan biet doi xu",
            "kich dong bao luc", "keu goi bao luc", "thiet ke vu khi",
            "huong dan tan cong", "khung bo", "che sung", "mua sung", "dao gam",
            "dau doc", "dot nha", "pha xe", "tan cong nguoi",
            "how to kill", "how to make bomb", "how to make weapon",
            "terrorism", "genocide", "hate speech", "racial slur",
            "instructions for violence", "attack tutorial"
    );

    private static final List<String> UNHEALTHY_CONTENT_KEYWORDS = List.of(
            "co bac", "ca cuoc", "ca do", "danh bai", "slot machine", "casino",
            "betting", "gambling", "lo de", "so xo", "choi bai", "bai bac",
            "tai xiu", "xoc dia", "keo bong", "soi keo", "nha cai", "danh de",
            "ma tuy", "heroin", "cocaine", "meth", "amphetamine", "chat kich thich",
            "mua thuoc phien", "ban ma tuy", "lam quen chat kich thich",
            "can sa", "co my", "ke ma tuy", "ma tuy da", "thuoc lac",
            "lua dao", "scam", "phishing", "hack tai khoan", "danh cap mat khau",
            "crack pass", "brute force", "keygen", "malware", "ransomware",
            "mua ban thuoc", "thuoc kich thich", "ponzi", "da cap", "vay nong"
    );

    private static final List<String> HARMFUL_CONTENT_KEYWORDS = List.of(
            "vuot tuong lua", "dat bom", "vu khi sat thuong",
            "mua ban nguoi", "noi dung khieu dam",
            "deep fake", "ai nude", "generate nude", "lam web phishing",
            "keylogger", "trojan", "ddos", "sql injection", "xss",
            "be khoa", "crack password", "hack facebook", "hack zalo",
            "hack gmail", "lay cap cookie", "danh cap tai khoan"
    );

    private static final List<String> FINANCIAL_MEDICAL_KEYWORDS = List.of(
            "bao hiem y te", "chi phi benh vien", "phi kham", "quy khan cap",
            "du phong y te", "tiet kiem cho suc khoe", "health insurance"
    );

    private static final Pattern URL_IN_OUTPUT_PATTERN = Pattern.compile(
            "https?://(?!botdevgroup\\.me|localhost(?:[:/]|$))[\\w\\-.]+(?:/[^\\s]*)?"
    );

    private static final Pattern COERCIVE_SEXUAL_PATTERN = Pattern.compile(
            "(?i)(cach\\s+)?(du|ru|ep|lua|ga).{0,30}(con gai|phu nu|ban gai|nguoi yeu|co gai).{0,40}(nha nghi|khach san|quan he|lam tinh|sex)|"
                    + "(?i)(nha nghi|khach san|quan he|lam tinh|sex).{0,40}(du|ru|ep|lua|ga).{0,30}(con gai|phu nu|ban gai|nguoi yeu|co gai)",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    private static final Pattern SEXUAL_EXPLOITATION_PATTERN = Pattern.compile(
            "(?i)(tre em|tre vi thanh nien|duoi\\s*18|hoc sinh|be gai|be trai).{0,40}(sex|anh nong|clip nong|khoa than|quan he)|"
                    + "(?i)(tong tien|de doa|ep buoc|lua).{0,40}(anh nong|clip nong|quan he|sex)|"
                    + "(?i)(gai|trai).{0,15}(duoi\\s*18|vi thanh nien)",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    private static final Pattern WEAPON_VIOLENCE_PATTERN = Pattern.compile(
            "(?i)(cach|huong dan|che|lam|mua|tim).{0,30}(bom|sung|vu khi|dao gam|chat no|thuoc no)|"
                    + "(?i)(cach|huong dan).{0,30}(giet|dam|danh|tan cong|dau doc|tra tan|dot nha|pha xe)",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    private static final Pattern CYBER_ABUSE_PATTERN = Pattern.compile(
            "(?i)(cach|huong dan|lam|tao|viet|mua).{0,35}(phishing|keylogger|malware|ransomware|trojan|ddos|virus)|"
                    + "(?i)(hack|be khoa|crack|lay cap|danh cap).{0,35}(facebook|zalo|gmail|tai khoan|mat khau|cookie|otp)|"
                    + "(?i)(sql injection|xss|brute force|credential stuffing)",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    private static final Pattern GAMBLING_PATTERN = Pattern.compile(
            "(?i)(soi|xin|cho|du doan|cach thang|keo).{0,25}(keo|tai xiu|lo de|xoc dia|ca do|nha cai)|"
                    + "(?i)(danh|choi|vao).{0,20}(lo de|tai xiu|xoc dia|casino|ca do)",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    private static final Pattern DRUG_ABUSE_PATTERN = Pattern.compile(
            "(?i)(cach|huong dan|mua|ban|trong|pha che|ship|tim).{0,30}(ma tuy|can sa|co my|heroin|cocaine|meth|thuoc lac|ke ma tuy)|"
                    + "(?i)(cach).{0,20}(phe|phieu|len dinh).{0,20}(ma tuy|can sa|ke|thuoc lac)?",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    private AIContentGuard() {
    }

    public enum GuardResult {
        PASS,
        INJECTION_DETECTED,
        POLITICAL_TOPIC,
        MEDICAL_DIAGNOSIS,
        SELF_HARM,
        SEXUAL_CONTENT,
        VIOLENCE_HATE,
        UNHEALTHY_CONTENT,
        HARMFUL_CONTENT,
        OUT_OF_SCOPE
    }

    public static GuardResult checkInput(String message) {
        if (message == null || message.isBlank()) {
            return GuardResult.PASS;
        }

        String normalized = normalizeForCheck(message);

        if (INJECTION_PATTERN.matcher(normalized).find()) {
            return GuardResult.INJECTION_DETECTED;
        }
        if (containsAny(normalized, SELF_HARM_KEYWORDS)) {
            return GuardResult.SELF_HARM;
        }
        if (COERCIVE_SEXUAL_PATTERN.matcher(normalized).find()) {
            return GuardResult.SEXUAL_CONTENT;
        }
        if (SEXUAL_EXPLOITATION_PATTERN.matcher(normalized).find()) {
            return GuardResult.SEXUAL_CONTENT;
        }
        if (containsAny(normalized, SEXUAL_CONTENT_KEYWORDS)) {
            return GuardResult.SEXUAL_CONTENT;
        }
        if (WEAPON_VIOLENCE_PATTERN.matcher(normalized).find()) {
            return GuardResult.VIOLENCE_HATE;
        }
        if (containsAny(normalized, VIOLENCE_HATE_KEYWORDS)) {
            return GuardResult.VIOLENCE_HATE;
        }
        if (CYBER_ABUSE_PATTERN.matcher(normalized).find()) {
            return GuardResult.HARMFUL_CONTENT;
        }
        if (GAMBLING_PATTERN.matcher(normalized).find() || DRUG_ABUSE_PATTERN.matcher(normalized).find()) {
            return GuardResult.UNHEALTHY_CONTENT;
        }
        if (containsAny(normalized, UNHEALTHY_CONTENT_KEYWORDS)) {
            return GuardResult.UNHEALTHY_CONTENT;
        }
        if (containsAny(normalized, HARMFUL_CONTENT_KEYWORDS)) {
            return GuardResult.HARMFUL_CONTENT;
        }
        if (containsAny(normalized, POLITICAL_KEYWORDS)) {
            return GuardResult.POLITICAL_TOPIC;
        }
        if (containsAny(normalized, MEDICAL_DIAGNOSIS_KEYWORDS) && !isFinancialContext(normalized)) {
            return GuardResult.MEDICAL_DIAGNOSIS;
        }

        return GuardResult.PASS;
    }

    public static String sanitizeOutput(String aiOutput) {
        if (aiOutput == null || aiOutput.isBlank()) {
            return aiOutput;
        }
        return URL_IN_OUTPUT_PATTERN.matcher(aiOutput).replaceAll("[link d\u00e3 \u1ea9n]");
    }

    public static List<String> sanitizeHistoryContent(List<String> contents) {
        if (contents == null || contents.isEmpty()) {
            return List.of();
        }

        return contents.stream()
                .map(content -> content != null && INJECTION_PATTERN.matcher(content).find()
                        ? "[n\u1ed9i dung \u0111\u00e3 \u0111\u01b0\u1ee3c l\u1ecdc]"
                        : content)
                .toList();
    }

    public static String getRefusalMessage(GuardResult result) {
        if (result == null) {
            return "C\u00e2u h\u1ecfi n\u00e0y n\u1eb1m ngo\u00e0i chuy\u00ean m\u00f4n t\u00e0i ch\u00ednh c\u00e1 nh\u00e2n c\u1ee7a m\u00ecnh. B\u1ea1n c\u00f3 mu\u1ed1n h\u1ecfi v\u1ec1 chi ti\u00eau, thu nh\u1eadp hay ti\u1ebft ki\u1ec7m kh\u00f4ng?";
        }

        return switch (result) {
            case PASS, OUT_OF_SCOPE ->
                    "C\u00e2u h\u1ecfi n\u00e0y n\u1eb1m ngo\u00e0i chuy\u00ean m\u00f4n t\u00e0i ch\u00ednh c\u00e1 nh\u00e2n c\u1ee7a m\u00ecnh. B\u1ea1n c\u00f3 mu\u1ed1n h\u1ecfi v\u1ec1 chi ti\u00eau, thu nh\u1eadp hay ti\u1ebft ki\u1ec7m kh\u00f4ng?";
            case INJECTION_DETECTED ->
                    "M\u00ecnh kh\u00f4ng th\u1ec3 x\u1eed l\u00fd y\u00eau c\u1ea7u n\u00e0y. B\u1ea1n c\u00f3 c\u00e2u h\u1ecfi n\u00e0o v\u1ec1 t\u00e0i ch\u00ednh c\u00e1 nh\u00e2n kh\u00f4ng? \ud83d\ude0a";
            case POLITICAL_TOPIC ->
                    "M\u00ecnh l\u00e0 tr\u1ee3 l\u00fd t\u00e0i ch\u00ednh n\u00ean kh\u00f4ng th\u1ec3 t\u01b0 v\u1ea5n v\u1ec1 ch\u1ee7 \u0111\u1ec1 ch\u00ednh tr\u1ecb. N\u1ebfu b\u1ea1n c\u00f3 c\u00e2u h\u1ecfi v\u1ec1 qu\u1ea3n l\u00fd chi ti\u00eau hay ti\u1ebft ki\u1ec7m, m\u00ecnh r\u1ea5t s\u1eb5n l\u00f2ng gi\u00fap! \ud83d\ude0a";
            case MEDICAL_DIAGNOSIS ->
                    "M\u00ecnh chuy\u00ean v\u1ec1 t\u00e0i ch\u00ednh c\u00e1 nh\u00e2n n\u00e0n kh\u00f4ng th\u1ec3 ch\u1ea9n \u0111o\u00e1n b\u1ec7nh hay t\u01b0 v\u1ea5n y t\u1ebf. B\u1ea1n n\u00ean tham kh\u1ea3o \u00fd ki\u1ebfn b\u00e1c s\u0129 tr\u1ef1c ti\u1ebfp nh\u00e9. N\u1ebfu b\u1ea1n c\u1ea7n t\u00ednh chi ph\u00ed y t\u1ebf hay b\u1ea3o hi\u1ec3m, m\u00ecnh c\u00f3 th\u1ec3 gi\u00fap \u0111\u1ee1! \ud83d\ude0a";
            case SELF_HARM ->
                    "M\u00ecnh nghe th\u1ea5y b\u1ea1n \u0111ang kh\u00f4ng \u1ed5n. B\u1ea1n kh\u00f4ng \u0111\u01a1n \u0111\u1ed9c \u0111\u00e2u. \u2764\ufe0f\n\nXin h\u00e3y li\u00ean h\u1ec7 \u0111\u01b0\u1eddng d\u00e2y h\u1ed7 tr\u1ee3 s\u1ee9c kh\u1ecfe t\u00e2m th\u1ea7n: **1800 599 920** (mi\u1ec5n ph\u00ed, 24/7).\nN\u1ebfu b\u1ea1n mu\u1ed1n chia s\u1ebb v\u1ec1 \u00e1p l\u1ef1c t\u00e0i ch\u00ednh \u0111ang g\u1eb7p ph\u1ea3i, m\u00ecnh s\u1eb5n s\u00e0ng l\u1eafng nghe v\u00e0 gi\u00fap b\u1ea1n t\u00ecm gi\u1ea3i ph\u00e1p.";
            case SEXUAL_CONTENT ->
                    "M\u00ecnh kh\u00f4ng h\u1ed7 tr\u1ee3 n\u1ed9i dung lo\u1ea1i n\u00e0y. Nova ch\u1ec9 d\u00e0nh cho t\u00e0i ch\u00ednh c\u00e1 nh\u00e2n \u2013 chi ti\u00eau, ti\u1ebft ki\u1ec7m, ng\u00e2n s\u00e1ch. B\u1ea1n c\u00f3 c\u00e2u h\u1ecfi t\u00e0i ch\u00ednh n\u00e0o kh\u00f4ng? \ud83d\ude0a";
            case VIOLENCE_HATE ->
                    "M\u00ecnh kh\u00f4ng th\u1ec3 h\u1ed7 tr\u1ee3 n\u1ed9i dung li\u00ean quan \u0111\u1ebfn b\u1ea1o l\u1ef1c hay k\u00edch \u0111\u1ed9ng. N\u1ebfu b\u1ea1n c\u00f3 c\u00e2u h\u1ecfi v\u1ec1 qu\u1ea3n l\u00fd t\u00e0i ch\u00ednh, m\u00ecnh lu\u00f4n s\u1eb5n s\u00e0ng gi\u00fap! \ud83d\ude0a";
            case UNHEALTHY_CONTENT ->
                    "Ch\u1ee7 \u0111\u1ec1 n\u00e0y n\u1eb1m ngo\u00e0i ph\u1ea1m vi c\u1ee7a m\u00ecnh. M\u00ecnh kh\u00f4ng t\u01b0 v\u1ea5n v\u1ec1 c\u1edd b\u1ea1c, c\u00e1 \u0111\u1ed9 hay c\u00e1c ho\u1ea1t \u0111\u1ed9ng c\u00f3 th\u1ec3 g\u00e2y h\u1ea1i t\u00e0i ch\u00ednh. N\u1ebfu b\u1ea1n lo l\u1eafng v\u1ec1 chi ti\u00eau kh\u00f4ng ki\u1ec3m so\u00e1t, m\u00ecnh c\u00f3 th\u1ec3 gi\u00fap b\u1ea1n l\u1eadp ng\u00e2n s\u00e1ch v\u00e0 ki\u1ec3m so\u00e1t th\u00f3i quen chi ti\u00eau nh\u00e9! \ud83d\ude0a";
            case HARMFUL_CONTENT ->
                    "Y\u00eau c\u1ea7u n\u00e0y n\u1eb1m ngo\u00e0i ph\u1ea1m vi h\u1ed7 tr\u1ee3 c\u1ee7a m\u00ecnh. M\u00ecnh c\u00f3 th\u1ec3 gi\u00fap b\u1ea1n v\u1ec1 qu\u1ea3n l\u00fd chi ti\u00eau, ti\u1ebft ki\u1ec7m v\u00e0 t\u00e0i ch\u00ednh c\u00e1 nh\u00e2n! \ud83d\ude0a";
        };
    }

    private static String normalizeForCheck(String text) {
        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ")
                .trim();
    }

    private static boolean containsAny(String normalized, List<String> keywords) {
        return keywords.stream()
                .map(AIContentGuard::normalizeForCheck)
                .anyMatch(normalized::contains);
    }

    private static boolean isFinancialContext(String normalized) {
        return containsAny(normalized, FINANCIAL_MEDICAL_KEYWORDS);
    }
}
