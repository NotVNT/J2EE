import LandingNavbar from "../components/landing/LandingNavbar.jsx";
import HeroPanel from "../components/landing/HeroPanel.jsx";
import RightVisualPanel from "../components/landing/RightVisualPanel.jsx";
import TestimonialPanel from "../components/landing/TestimonialPanel.jsx";

const LandingPage = () => {
    return (
        <div className="min-h-screen w-full bg-[#0a1103]">
            <main className="grid min-h-screen w-full gap-8 px-4 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-10">
                <section className="lg:border-r lg:border-lime-300/20 lg:pr-8">
                    <LandingNavbar />
                    <HeroPanel />
                    <TestimonialPanel />
                </section>

                <RightVisualPanel />
            </main>
        </div>
    );
};

export default LandingPage;