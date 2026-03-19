import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroPanel = () => {
  return (
    <section>
      <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
        Dev<span className="text-lime-300">bot</span> giúp bạn quản lý tài chính cá nhân một cách dễ dàng và hiệu quả.
      </h1>

      <p className="mt-6 max-w-lg text-base text-lime-100/75 sm:text-lg">
        Theo dõi thu nhập, chi phí và dòng tiền trên một dashboard trực quan, đồng bộ.
Tự tin đưa ra quyết định với các phân tích tài chính theo thời gian thực.
      </p>
    </section>
  );
};

export default HeroPanel;
