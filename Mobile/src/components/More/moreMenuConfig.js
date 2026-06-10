export const MORE_MENU_GROUPS = [
  {
    title: "TÀI KHOẢN",
    items: [
      { key: "edit-profile", icon: "lock-closed-outline", title: "Đổi mật khẩu", route: "EditProfile" },
      { key: "payment", icon: "card-outline", title: "Thanh toán & Nâng cấp", route: "Payment" }
    ]
  },
  {
    title: "TÙY CHỈNH",
    items: [
      { key: "currency", icon: "cash-outline", title: "Đơn vị tiền tệ", value: "VND", hasChevron: false },
      { key: "language", icon: "globe-outline", title: "Ngôn ngữ", value: "Vietnamese", hasChevron: false }
    ]
  },
  {
    title: "QUẢN LÝ TÀI CHÍNH",
    items: [
      { key: "jars", icon: "archive-outline", title: "Hũ chi tiêu phụ", route: "HomeTab", params: { screen: "Jars" } },
      { key: "goals", icon: "flag-outline", title: "Mục tiêu tiết kiệm", route: "HomeTab", params: { screen: "Goal" } },
      { key: "reports", icon: "bar-chart-outline", title: "Báo cáo thu chi tháng", route: "HomeTab", params: { screen: "Reports" } }
    ]
  },
  {
    title: "THÔNG TIN ỨNG DỤNG",
    items: [
      { key: "help", icon: "help-circle-outline", title: "Trợ giúp & Hỗ trợ", hasChevron: true },
      { key: "privacy", icon: "shield-checkmark-outline", title: "Chính sách bảo mật", hasChevron: true },
      { key: "about", icon: "information-circle-outline", title: "Về ứng dụng", value: "1.5", hasChevron: true }
    ]
  }
];
