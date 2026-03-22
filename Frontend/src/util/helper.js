/**
 * formatCurrency: Chuyển đổi một số (hoặc chuỗi số) thành chuỗi có phân tách hàng nghìn
 * VD: "1500000" -> "1.500.000"
 */
export const formatCurrency = (value) => {
    if (value === null || value === undefined) return "";
    
    // Xóa các ký tự không phải là số
    const digits = value.toString().replace(/\D/g, "");
    if (!digits) return "";
    
    // Trả về định dạng ngăn cách theo kiểu Việt Nam (dấu chấm)
    return new Intl.NumberFormat("vi-VN").format(Number(digits));
};

/**
 * parseCurrency: Chuyển đổi chuỗi có phân cách về lại số nguyên
 * VD: "1.500.000" -> 1500000
 */
export const parseCurrency = (value) => {
    if (!value) return 0;
    const digits = value.toString().replace(/\D/g, "");
    return digits ? Number(digits) : 0;
};
