import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-surface text-on-surface font-body selection:bg-secondary/30">

            {/*  TopNavBar  */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(25,28,30,0.04)]">
                <div className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20">
                    <div className="text-2xl font-black text-[#0A2463] tracking-tighter">Money Manager</div>
                    <div className="hidden md:flex items-center gap-8">
                        <a className="text-[#0A2463] font-bold border-b-2 border-[#6100c6] pb-1 font-['Plus_Jakarta_Sans'] text-sm tracking-tight" href="#">Trang Chủ</a>
                        <a className="text-[#191c1e]/60 hover:text-[#0A2463] transition-colors font-['Plus_Jakarta_Sans'] text-sm tracking-tight" href="#">Tính Năng</a>
                        <a className="text-[#191c1e]/60 hover:text-[#0A2463] transition-colors font-['Plus_Jakarta_Sans'] text-sm tracking-tight" href="#">Mục Tiêu</a>
                        <a className="text-[#191c1e]/60 hover:text-[#0A2463] transition-colors font-['Plus_Jakarta_Sans'] text-sm tracking-tight" href="#">Báo Cáo</a>
                        <a className="text-[#191c1e]/60 hover:text-[#0A2463] transition-colors font-['Plus_Jakarta_Sans'] text-sm tracking-tight" href="#">Bảng Giá</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/login')} className="text-[#0A2463] font-['Plus_Jakarta_Sans'] text-sm font-medium px-4 py-2 rounded-full hover:bg-[#f2f4f6] transition-all transition-all duration-300 ease-in-out hover:scale-105 hover:bg-surface-container">Đăng Nhập</button>
                        <button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-full font-['Plus_Jakarta_Sans'] text-sm font-bold shadow-lg hover:opacity-90 active:scale-95 duration-200 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:brightness-110">Bắt Đầu</button>
                    </div>
                </div>
            </nav>
            {/*  Hero Section  */}
            <header className="relative pt-32 pb-20 overflow-hidden">
                {/*  Abstract Background Glows  */}
                <div className="absolute top-0 right-0 -z-10 w-1/2 h-1/2 bg-secondary/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 -z-10 w-1/3 h-1/3 bg-primary/5 blur-[100px] rounded-full"></div>
                <div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2 text-center lg:text-left">
                        <span className="inline-block py-1 px-3 mb-6 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-xs font-bold uppercase tracking-widest">Giải Pháp Công Nghệ</span>
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-primary font-headline leading-[1.1] mb-6 tracking-tight">
                            Quản lý tài chính <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary-container">thông minh</span> và dễ dàng
                        </h1>
                        <p className="text-xl text-on-surface-variant mb-10 max-w-xl leading-relaxed">
                            Theo dõi thu nhập, chi tiêu, ngân sách và mục tiêu tiết kiệm trong một nền tảng trực quan và an toàn tuyệt đối.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <button onClick={() => navigate('/signup')} className="w-full sm:w-auto bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-primary/20 snappy-transition transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:brightness-110">
                                Bắt đầu miễn phí
                            </button>
                            <button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto flex items-center justify-center gap-2 border border-outline-variant text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-surface-container-low snappy-transition transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/5 hover:border-primary">
                                <span className="material-symbols-outlined">play_circle</span>
                                Xem demo
                            </button>
                        </div>
                    </div>
                    <div className="lg:w-1/2 relative group">
                        {/*  Mockup Dashboard Container  */}
                        <div className="relative bg-surface-container-lowest rounded-[2.5rem] shadow-2xl p-4 overflow-hidden border border-white/50">
                            <img alt="Financial Dashboard Preview" className="rounded-[1.5rem] w-full object-cover aspect-[4/3] opacity-90" data-alt="Modern high-fidelity fintech dashboard interface showing bar charts, credit cards, and colorful expense categories in a clean minimal layout" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUxTWDZB85sXTl6SXbfWuvp2EUwLCemU-FZvdBrNbssTraz-_Y22L4ezm8SGurAhMgqEGPD-UEF-E0bryNloTPVNSkA8T-aSq9nS-UeQ9t5vcafsDhRU1n9cXK6gaCZAEE0HEip4NNU372iXDsKNeyiG4HOszQ7eU4uQXzYrVq7_l8jvfjBZ_9-yS6X2sowV7OIzqjN26PJoqVJUl4Qpz5IB-DqKmi19hoAXv_t2vr41thRXHHknsaLredFVFulvU4-wuAyQc9t7Gy" />
                            {/*  Floating Overlays  */}
                            <div className="absolute top-12 -left-10 glass-card p-6 rounded-2xl shadow-xl border border-white/20 animate-bounce-slow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined">trending_up</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-on-surface-variant font-medium">Tiết kiệm tháng này</p>
                                        <p className="text-xl font-bold text-primary">+12,500,000đ</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-12 -right-6 glass-card p-5 rounded-2xl shadow-xl border border-white/20">
                                <p className="text-xs text-on-surface-variant font-medium mb-3 uppercase tracking-tighter">Giao dịch gần đây</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm">shopping_bag</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold">Dịch Vụ Cửa Hàng</p>
                                        </div>
                                        <p className="text-xs font-semibold text-error">-1,200k</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm">payments</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold">Nhận Lương</p>
                                        </div>
                                        <p className="text-xs font-semibold text-secondary">+45,000k</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {/*  Feature Cards Section  */}
            <section className="py-24 bg-surface-container-low">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-extrabold text-primary font-headline mb-4 tracking-tight">Tính năng đột phá</h2>
                        <p className="text-on-surface-variant max-w-2xl mx-auto">Mọi công cụ bạn cần để làm chủ tài chính cá nhân đều được tích hợp trong một trải nghiệm duy nhất.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/*  Card 1  */}
                        <div className="bg-surface-container-lowest p-10 rounded-[2rem] hover:scale-[1.02] snappy-transition group shadow-sm hover:shadow-xl">
                            <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white snappy-transition">
                                <span className="material-symbols-outlined text-3xl">analytics</span>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-primary">Theo dõi thu chi</h3>
                            <p className="text-on-surface-variant leading-relaxed">Tự động phân loại các khoản chi tiêu từ hóa đơn và lịch sử giao dịch một cách thông minh.</p>
                        </div>
                        {/*  Card 2  */}
                        <div className="bg-surface-container-lowest p-10 rounded-[2rem] hover:scale-[1.02] snappy-transition group shadow-sm hover:shadow-xl">
                            <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white snappy-transition">
                                <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-primary">Quản lý ngân sách</h3>
                            <p className="text-on-surface-variant leading-relaxed">Thiết lập giới hạn chi tiêu cho từng danh mục và nhận cảnh báo khi bạn sắp vượt ngưỡng.</p>
                        </div>
                        {/*  Card 3  */}
                        <div className="bg-surface-container-lowest p-10 rounded-[2rem] hover:scale-[1.02] snappy-transition group shadow-sm hover:shadow-xl">
                            <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white snappy-transition">
                                <span className="material-symbols-outlined text-3xl">savings</span>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-primary">Mục tiêu tiết kiệm</h3>
                            <p className="text-on-surface-variant leading-relaxed">Hình ảnh hóa các kế hoạch mua nhà, xe hay du lịch với lộ trình tích lũy cụ thể hàng tháng.</p>
                        </div>
                        {/*  Card 4  */}
                        <div className="bg-surface-container-lowest p-10 rounded-[2rem] hover:scale-[1.02] snappy-transition group shadow-sm hover:shadow-xl">
                            <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white snappy-transition">
                                <span className="material-symbols-outlined text-3xl">bar_chart</span>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-primary">Báo cáo trực quan</h3>
                            <p className="text-on-surface-variant leading-relaxed">Biểu đồ xu hướng tài chính giúp bạn hiểu rõ dòng tiền của mình đang đi về đâu.</p>
                        </div>
                        {/*  Card 5  */}
                        <div className="bg-surface-container-lowest p-10 rounded-[2rem] hover:scale-[1.02] snappy-transition group shadow-sm hover:shadow-xl">
                            <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white snappy-transition">
                                <span className="material-symbols-outlined text-3xl">psychology</span>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-primary">Phân tích AI</h3>
                            <p className="text-on-surface-variant leading-relaxed">Trí tuệ nhân tạo gợi ý cách tối ưu hóa chi phí dựa trên thói quen sinh hoạt của bạn.</p>
                        </div>
                        {/*  Card 6  */}
                        <div className="bg-surface-container-lowest p-10 rounded-[2rem] hover:scale-[1.02] snappy-transition group shadow-sm hover:shadow-xl">
                            <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white snappy-transition">
                                <span className="material-symbols-outlined text-3xl">security</span>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-primary">Bảo mật cấp Vault</h3>
                            <p className="text-on-surface-variant leading-relaxed">Dữ liệu được mã hóa đầu cuối với tiêu chuẩn ngân hàng, đảm bảo quyền riêng tư tuyệt đối.</p>
                        </div>
                    </div>
                </div>
            </section>
            {/*  Dashboard Preview Section (Asymmetric Layout)  */}
            <section className="py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/3">
                            <h2 className="text-4xl font-extrabold text-primary font-headline mb-8 tracking-tight">Trải nghiệm quyền năng tài chính thực thụ</h2>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-secondary mt-1">check_circle</span>
                                    <p className="text-on-surface-variant font-medium">Giao diện Dashboard tùy chỉnh theo nhu cầu</p>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-secondary mt-1">check_circle</span>
                                    <p className="text-on-surface-variant font-medium">Đồng bộ hóa đa thiết bị theo thời gian thực</p>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-secondary mt-1">check_circle</span>
                                    <p className="text-on-surface-variant font-medium">Xuất dữ liệu báo cáo chuyên sâu chỉ với 1 click</p>
                                </li>
                            </ul>
                            <button className="mt-10 text-secondary font-bold flex items-center gap-2 hover:translate-x-2 snappy-transition">
                                Khám phá chi tiết hệ thống <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                        <div className="lg:w-2/3 relative flex items-center justify-center">
                            <div className="flex w-full bg-[#f2f4f6] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white h-[500px]">
                                {/*  Sidebar Mockup  */}
                                <div className="w-20 bg-primary flex flex-col items-center py-8 gap-8">
                                    <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined">dashboard</span>
                                    </div>
                                    <span className="material-symbols-outlined text-white/40">receipt_long</span>
                                    <span className="material-symbols-outlined text-white/40">account_balance_wallet</span>
                                    <span className="material-symbols-outlined text-white/40">savings</span>
                                </div>
                                {/*  Content Mockup  */}
                                <div className="flex-1 p-8 overflow-hidden">
                                    <div className="flex justify-between items-center mb-8">
                                        <h4 className="text-2xl font-bold text-primary">Tổng Quan</h4>
                                        <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-white"></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                                            <p className="text-xs text-on-surface-variant mb-1">Tổng Số Dư</p>
                                            <p className="text-2xl font-black text-primary tracking-tight">248,500,000đ</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                                            <p className="text-xs text-on-surface-variant mb-1">Chi Tiêu Tuần</p>
                                            <p className="text-2xl font-black text-secondary tracking-tight">4,200,000đ</p>
                                        </div>
                                    </div>
                                    <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-black/5 h-full">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="font-bold text-primary">Dòng Tiền</p>
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                                                <div className="w-3 h-3 rounded-full bg-primary-container"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-end gap-2 h-32">
                                            <div className="bg-secondary-fixed w-full h-2/3 rounded-t-lg"></div>
                                            <div className="bg-primary-container w-full h-1/2 rounded-t-lg"></div>
                                            <div className="bg-secondary-fixed w-full h-full rounded-t-lg"></div>
                                            <div className="bg-primary-container w-full h-3/4 rounded-t-lg"></div>
                                            <div className="bg-secondary-fixed w-full h-4/5 rounded-t-lg"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/*  Pricing Section  */}
            <section className="py-24 bg-surface">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-extrabold text-primary font-headline mb-4 tracking-tight">Gói dịch vụ linh hoạt</h2>
                        <p className="text-on-surface-variant max-w-xl mx-auto">Chọn lộ trình tài chính phù hợp với mục tiêu của bạn.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/*  Free Tier  */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-outline-variant/30 flex flex-col snappy-transition">
                            <h3 className="text-xl font-bold mb-2">Miễn Phí</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black text-primary">0đ</span>
                                <span className="text-on-surface-variant">/tháng</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <span className="material-symbols-outlined text-primary text-lg">check</span> Theo dõi 2 ví cơ bản
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <span className="material-symbols-outlined text-primary text-lg">check</span> Báo cáo hàng tháng
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium text-on-surface-variant/50">
                                    <span className="material-symbols-outlined text-lg">close</span> Phân tích AI chuyên sâu
                                </li>
                            </ul>
                            <button className="w-full py-4 rounded-full font-bold text-primary border border-primary hover:bg-primary hover:text-white snappy-transition transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/5 hover:shadow-md">Bắt đầu ngay</button>
                        </div>
                        {/*  Pro Tier (Highlighted)  */}
                        <div className="bg-primary p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col snappy-transition transform scale-105 z-10">
                            <div className="absolute top-6 right-6 bg-secondary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Phổ Biến</div>
                            <h3 className="text-xl font-bold mb-2 text-white">Pro</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black text-white">99k</span>
                                <span className="text-white/60">/tháng</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-center gap-3 text-sm font-medium text-white">
                                    <span className="material-symbols-outlined text-secondary text-lg">verified</span> Không giới hạn ví
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium text-white">
                                    <span className="material-symbols-outlined text-secondary text-lg">verified</span> Đồng bộ ngân hàng tự động
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium text-white">
                                    <span className="material-symbols-outlined text-secondary text-lg">verified</span> 10 Mục tiêu tiết kiệm Pro
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium text-white">
                                    <span className="material-symbols-outlined text-secondary text-lg">verified</span> Hỗ trợ 24/7 Priority
                                </li>
                            </ul>
                            <button className="w-full py-4 rounded-full font-bold bg-secondary text-white shadow-lg hover:shadow-secondary/40 active:scale-95 snappy-transition transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:brightness-110">Nâng cấp Pro</button>
                        </div>
                        {/*  Premium Tier  */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-outline-variant/30 flex flex-col snappy-transition">
                            <h3 className="text-xl font-bold mb-2">Premium</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black text-primary">249k</span>
                                <span className="text-on-surface-variant">/tháng</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <span className="material-symbols-outlined text-primary text-lg">check</span> Toàn bộ tính năng Pro
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <span className="material-symbols-outlined text-primary text-lg">check</span> Cố vấn tài chính AI cá nhân
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <span className="material-symbols-outlined text-primary text-lg">check</span> Quản lý đầu tư Portfolio
                                </li>
                            </ul>
                            <button className="w-full py-4 rounded-full font-bold text-primary border border-primary hover:bg-primary hover:text-white snappy-transition transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/5 hover:shadow-md">Liên hệ tư vấn</button>
                        </div>
                    </div>
                </div>
            </section>
            {/*  Testimonials Section  */}
            <section className="py-24 bg-surface-container-low/30">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-primary font-headline mb-4 tracking-tight">Người dùng nói về chúng tôi</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm italic text-on-surface-variant relative">
                            <span className="material-symbols-outlined absolute top-4 left-4 text-primary-fixed text-4xl opacity-50">format_quote</span>
                            <p className="mb-6 relative z-10">"Từ ngày dùng app này, mình đã tiết kiệm được thêm 20% thu nhập hàng tháng nhờ việc kiểm soát chi tiêu chặt chẽ hơn. Interface cực kỳ mượt!"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary-fixed"></div>
                                <div>
                                    <p className="text-sm font-bold text-primary">Minh Anh</p>
                                    <p className="text-xs">Freelancer Designer</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm italic text-on-surface-variant relative">
                            <span className="material-symbols-outlined absolute top-4 left-4 text-primary-fixed text-4xl opacity-50">format_quote</span>
                            <p className="mb-6 relative z-10">"Tính năng AI phân tích tài chính rất hay, nó chỉ ra cho mình những khoản 'chi phí rác' mà trước giờ mình không hề để ý."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-fixed"></div>
                                <div>
                                    <p className="text-sm font-bold text-primary">Hoàng Long</p>
                                    <p className="text-xs">Marketing Manager</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm italic text-on-surface-variant relative">
                            <span className="material-symbols-outlined absolute top-4 left-4 text-primary-fixed text-4xl opacity-50">format_quote</span>
                            <p className="mb-6 relative z-10">"Mình đã thử qua nhiều app quản lý tiền nhưng Money Manager là tinh tế nhất. Không quảng cáo, không rườm rà, tập trung hoàn toàn vào dữ liệu."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary-fixed-dim"></div>
                                <div>
                                    <p className="text-sm font-bold text-primary">Thanh Thảo</p>
                                    <p className="text-xs">Content Creator</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/*  Footer  */}
            <footer className="w-full border-t border-[#191c1e]/5 bg-[#f8f9fb]">
                <div className="max-w-7xl mx-auto px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <div className="text-2xl font-black text-[#0A2463] tracking-tighter mb-6">Money Manager</div>
                            <p className="text-sm text-on-surface-variant leading-relaxed">Nền tảng quản lý tài chính thế hệ mới, giúp bạn kiến tạo một tương lai thịnh vượng và an tâm.</p>
                        </div>
                        <div>
                            <h5 className="text-xs uppercase tracking-[0.05em] font-bold mb-6 text-primary">Liên Kết Nhanh</h5>
                            <ul className="space-y-4">
                                <li><a className="text-sm text-on-surface-variant hover:text-secondary snappy-transition" href="#">Về chúng tôi</a></li>
                                <li><a className="text-sm text-on-surface-variant hover:text-secondary snappy-transition" href="#">Tính năng</a></li>
                                <li><a className="text-sm text-on-surface-variant hover:text-secondary snappy-transition" href="#">Giá dịch vụ</a></li>
                                <li><a className="text-sm text-on-surface-variant hover:text-secondary snappy-transition" href="#">Blog tài chính</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-xs uppercase tracking-[0.05em] font-bold mb-6 text-primary">Legal &amp; Security</h5>
                            <ul className="space-y-4">
                                <li><a className="text-sm text-on-surface-variant hover:text-secondary snappy-transition" href="#">Chính Sách Bảo Mật</a></li>
                                <li><a className="text-sm text-on-surface-variant hover:text-secondary snappy-transition" href="#">Điều Khoản Dịch Vụ</a></li>
                                <li><a className="text-sm text-on-surface-variant hover:text-secondary snappy-transition" href="#">Bảo Mật</a></li>
                                <li><a className="text-sm text-on-surface-variant hover:text-secondary snappy-transition" href="#">Cài Đặt Cookies</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-xs uppercase tracking-[0.05em] font-bold mb-6 text-primary">Đăng Ký Bản Tin</h5>
                            <p className="text-xs text-on-surface-variant mb-4">Nhận mẹo quản lý tài chính hàng tuần.</p>
                            <div className="flex">
                                <input className="bg-surface-container-high border-none rounded-l-full px-4 text-xs focus:ring-1 focus:ring-secondary w-full" placeholder="Email của bạn" type="email" />
                                <button className="bg-primary text-white p-3 rounded-r-full"><span className="material-symbols-outlined text-sm">send</span></button>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-outline-variant/20 gap-6">
                        <p className="font-['Inter'] text-xs uppercase tracking-[0.05em] text-[#191c1e]/40">© 2024 The Precision Vault. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a className="text-[#191c1e]/40 hover:text-secondary snappy-transition" href="#"><span className="material-symbols-outlined">public</span></a>
                            <a className="text-[#191c1e]/40 hover:text-secondary snappy-transition" href="#"><span className="material-symbols-outlined">smartphone</span></a>
                            <a className="text-[#191c1e]/40 hover:text-secondary snappy-transition" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default LandingPage;
