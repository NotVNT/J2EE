import React from 'react';

// Nguồn ảnh avatar Unsplash trông chân thực và giống người Việt hơn
const testimonials = [
  {
    initials: "AL",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?&w=120&q=80&auto=format&fit=crop", 
    name: "Nguyễn Anh Linh",
    title: "Chuyên viên Phân tích Dữ liệu",
    quote:
      "Nền tảng này cung cấp các phân tích dữ liệu chi tiêu rất khoa học, giúp tôi nhanh chóng nhận diện và tối ưu hóa các khoản chi không cần thiết.",
  },
  {
    initials: "HT",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?&w=120&q=80&auto=format&fit=crop",
    name: "Trần Hải Tú",
    title: "Freelancer Thiết kế",
    quote:
      "Là một freelancer, tôi đánh giá cao khả năng tùy chỉnh linh hoạt của trang web, cho phép tách biệt rõ ràng chi phí dự án và sinh hoạt cá nhân.",
  },
  {
    initials: "MP",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?&w=120&q=80&auto=format&fit=crop",
    name: "Lê Minh Phúc",
    title: "Quản lý Dự án Công nghệ",
    quote:
      "Giao diện tối giản nhưng bảo mật cao. Đây là một công cụ quy hoạch tài chính chuyên nghiệp, giúp tôi kiểm soát ngân sách hiệu quả ngay trên trình duyệt.",
  },
  {
    initials: "QN",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?&w=120&q=80&auto=format&fit=crop",
    name: "Phạm Quỳnh Như",
    title: "Chuyên viên Nhân sự",
    quote:
      "Báo cáo tổng quan được cá nhân hóa hoàn hảo. Tôi có thể dễ dàng nắm bắt bức tranh tài chính tổng thể mà không tốn nhiều thời gian như các phương pháp truyền thống.",
  },
  {
    initials: "DK",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?&w=120&q=80&auto=format&fit=crop",
    name: "Võ Đức Khang",
    title: "Nhà đầu tư Tài chính",
    quote:
      "Một công cụ tuyệt vời để quy hoạch lộ trình tự do tài chính. Sự linh hoạt trong việc theo dõi các mục tiêu đầu tư riêng biệt là điểm cộng lớn nhất.",
  },
];

const TestimonialPanel = () => {
  return (
    <section className="mt-10 space-y-4 sm:mt-16">
      {testimonials.map((item) => (
        <article
          key={item.name}
          className="rounded-2xl border border-lime-300/20 bg-white/5 p-5 backdrop-blur sm:p-6"
        >
          <div className="flex items-start gap-4">
            {/* Vùng Avatar */}
            <div className="grid h-16 w-16 flex-none place-items-center overflow-hidden rounded-full border-2 border-lime-300/30 bg-lime-300/15 text-xl font-bold text-lime-200">
              {item.avatar ? (
                <img
                  src={item.avatar}
                  alt={`Chân dung của ${item.name}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                item.initials
              )}
            </div>

            {/* Nội dung Testimonial */}
            <div>
              <h3 className="text-lg font-medium text-white sm:text-xl">{item.name}</h3>
              <p className="mt-1 text-sm text-lime-200/80">{item.title}</p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-lime-50/80 sm:text-base">
                "{item.quote}"
              </p>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
};

export default TestimonialPanel;