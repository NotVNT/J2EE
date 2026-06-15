export function translateNotification(title, message, language) {
  if (language !== "en") {
    return { title, message };
  }
  
  // Title mapping
  let translatedTitle = title;
  const titleMap = {
    "Thêm chi tiêu mới": "New expense added",
    "Thêm thu nhập mới": "New income added",
    "Vượt ngân sách": "Budget exceeded",
    "Cảnh báo ngân sách": "Budget warning",
    "Thanh toán thành công": "Payment successful",
    "Chi tiêu nhóm mới": "New group expense",
    "Thanh toán trong nhóm": "Group payment",
    "Hộp thư thông báo trống": "Notification inbox is empty",
  };
  
  if (titleMap[title]) {
    translatedTitle = titleMap[title];
  } else if (title && title.startsWith("⚠️ Cảnh báo ngân sách ")) {
    translatedTitle = title.replace("⚠️ Cảnh báo ngân sách ", "⚠️ Budget warning ");
  } else if (title && title.startsWith("📊 Bảng điểm tháng ")) {
    translatedTitle = title.replace("📊 Bảng điểm tháng ", "📊 Scorecard of month ");
  } else if (title && title.startsWith("🔥 Chuỗi ngày theo dõi ")) {
    translatedTitle = title.replace("🔥 Chuỗi ngày theo dõi ", "🔥 Tracking streak ");
  } else if (title && title.startsWith("🎯 Tiến độ mục tiêu")) {
    translatedTitle = "🎯 Goal progress";
  } else if (title && title.startsWith("🔴 Chi tiêu bất thường")) {
    translatedTitle = "🔴 Unusual spending";
  }

  // Message mapping
  let translatedMessage = message;
  if (!message) return { title: translatedTitle, message };

  // Match: Bạn vừa thêm khoản chi tiêu '%s' với số tiền %s VNĐ.
  if (message.startsWith("Bạn vừa thêm khoản chi tiêu '")) {
    const match = message.match(/^Bạn vừa thêm khoản chi tiêu '(.+?)' với số tiền (.+?) VNĐ\.$/);
    if (match) {
      translatedMessage = `You just added a new expense '${match[1]}' of ${match[2]} VND.`;
    }
  }
  // Match: Bạn vừa thêm khoản thu nhập '%s' với số tiền %s VNĐ.
  else if (message.startsWith("Bạn vừa thêm khoản thu nhập '")) {
    const match = message.match(/^Bạn vừa thêm khoản thu nhập '(.+?)' với số tiền (.+?) VNĐ\.$/);
    if (match) {
      translatedMessage = `You just added a new income '${match[1]}' of ${match[2]} VND.`;
    }
  }
  // Match: Ngân sách cho danh mục '%s' đã VƯỢT HẠN MỨC! Hãy điều chỉnh chi tiêu của bạn.
  else if (message.startsWith("Ngân sách cho danh mục '") && message.endsWith("đã VƯỢT HẠN MỨC! Hãy điều chỉnh chi tiêu của bạn.")) {
    const match = message.match(/^Ngân sách cho danh mục '(.+?)' đã VƯỢT HẠN MỨC! Hãy điều chỉnh chi tiêu của bạn\.$/);
    if (match) {
      translatedMessage = `Budget for category '${match[1]}' has EXCEEDED LIMIT! Please adjust your spending.`;
    }
  }
  // Match: Ngân sách cho danh mục '%s' sắp hết (đã dùng %d%).
  else if (message.startsWith("Ngân sách cho danh mục '") && message.includes("sắp hết (đã dùng")) {
    const match = message.match(/^Ngân sách cho danh mục '(.+?)' sắp hết \(đã dùng (\d+)%\)\.$/);
    if (match) {
      translatedMessage = `Budget for category '${match[1]}' is running low (used ${match[2]}%).`;
    }
  }
  // Match: Thanh toán thành công! Gói đăng ký %s của bạn đã được kích hoạt.
  else if (message.startsWith("Thanh toán thành công! Gói đăng ký ")) {
    const match = message.match(/^Thanh toán thành công! Gói đăng ký (.+?) của bạn đã được kích hoạt\.$/);
    if (match) {
      translatedMessage = `Payment successful! Your ${match[1]} subscription has been activated.`;
    }
  }
  // Match: Ngân sách '%s' đã đạt %d% (đã chi %s VNĐ / %s VNĐ). Hãy cân nhắc chi tiêu!
  else if (message.startsWith("Ngân sách '") && message.includes("đã đạt")) {
    const match = message.match(/^Ngân sách '(.+?)' đã đạt (\d+)% \(đã chi (.+?) VNĐ \/ (.+?) VNĐ\)\. Hãy cân nhắc chi tiêu!$/);
    if (match) {
      translatedMessage = `Budget '${match[1]}' has reached ${match[2]}% (spent ${match[3]} VND / ${match[4]} VND). Please consider your spending!`;
    }
  }
  // Match: Hôm nay bạn đã chi %s VNĐ, cao hơn %.1f lần so với mức trung bình hàng ngày (%s VNĐ). Hãy kiểm tra lại!
  else if (message.startsWith("Hôm nay bạn đã chi ")) {
    const match = message.match(/^Hôm nay bạn đã chi (.+?) VNĐ, cao hơn (.+?) lần so với mức trung bình hàng ngày \((.+?) VNĐ\)\. Hãy kiểm tra lại!$/);
    if (match) {
      translatedMessage = `Today you spent ${match[1]} VND, which is ${match[2]} times higher than your daily average (${match[3]} VND). Please review!`;
    }
  }
  // Match: Bạn vừa tiết kiệm được %s VNĐ cho '%s'. Hiện tại: %s VNĐ / %s VNĐ. Còn cần %s VNĐ nữa để đạt mục tiêu!
  else if (message.startsWith("Bạn vừa tiết kiệm được ")) {
    const match = message.match(/^Bạn vừa tiết kiệm được (.+?) VNĐ cho '(.+?)'\. Hiện tại: (.+?) VNĐ \/ (.+?) VNĐ\. Còn cần (.+?) VNĐ nữa để đạt mục tiêu!$/);
    if (match) {
      translatedMessage = `You saved ${match[1]} VND for '${match[2]}'. Current: ${match[3]} VND / ${match[4]} VND. Need ${match[5]} VND more to reach the goal!`;
    }
  }
  // Match: Điểm %s (%s) | Thu nhập: %s | Chi tiêu: %s | Tiết kiệm: %s (%.1f%%)
  else if (message.startsWith("Điểm ")) {
    const match = message.match(/^Điểm (.+?) \((.+?)\) \| Thu nhập: (.+?) \| Chi tiêu: (.+?) \| Tiết kiệm: (.+?) \((.+?)%\)$/);
    if (match) {
      translatedMessage = `Grade ${match[1]} (${match[2]}) | Income: ${match[3]} | Expense: ${match[4]} | Savings: ${match[5]} (${match[6]}%)`;
    }
  }
  // Match: Bạn đã có chuỗi %d ngày liên tiếp theo dõi tài chính! Hãy tiếp tục duy trì nhé! 💪
  else if (message.startsWith("Bạn đã có chuỗi ") && message.includes("ngày liên tiếp theo dõi tài chính!")) {
    const match = message.match(/^Bạn đã có chuỗi (\d+) ngày liên tiếp theo dõi tài chính! Hãy tiếp tục duy trì nhé! 💪$/);
    if (match) {
      translatedMessage = `You have tracked your finance for ${match[1]} consecutive days! Keep up the streak! 💪`;
    }
  }
  // Match: Khoản chi mới '%s' (%s VNĐ) vừa được thêm vào nhóm '%s'.
  else if (message.startsWith("Khoản chi mới '")) {
    const match = message.match(/^Khoản chi mới '(.+?)' \((.+?) VNĐ\) vừa được thêm vào nhóm '(.+?)'\.$/);
    if (match) {
      translatedMessage = `New expense '${match[1]}' (${match[2]} VND) has been added to group '${match[3]}'.`;
    }
  }
  // Match: %s vừa thanh toán khoản nợ %s VNĐ trong nhóm '%s'.
  else if (message.includes("vừa thanh toán khoản nợ") && message.includes("trong nhóm '")) {
    const match = message.match(/^(.+?) vừa thanh toán khoản nợ (.+?) VNĐ trong nhóm '(.+?)'\.$/);
    if (match) {
      translatedMessage = `${match[1]} has paid the debt of ${match[2]} VND in group '${match[3]}'.`;
    }
  }

  return { title: translatedTitle, message: translatedMessage };
}
