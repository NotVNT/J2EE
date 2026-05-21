import { createContext, useContext, useEffect, useState } from "react";

const PerformanceContext = createContext({
    isLowPerf: false,
    togglePerformanceMode: () => {},
});

export const PerformanceProvider = ({ children }) => {
    const [isLowPerf, setIsLowPerf] = useState(() => {
        return localStorage.getItem("performanceMode") === "low";
    });

    useEffect(() => {
        if (isLowPerf) {
            document.documentElement.setAttribute("data-performance", "low");
        } else {
            document.documentElement.removeAttribute("data-performance");
        }
    }, [isLowPerf]);

    const togglePerformanceMode = () => {
        setIsLowPerf((prev) => {
            const next = !prev;
            localStorage.setItem("performanceMode", next ? "low" : "");
            return next;
        });
    };

    return (
        <PerformanceContext.Provider value={{ isLowPerf, togglePerformanceMode }}>
            {children}
        </PerformanceContext.Provider>
    );
};

export const usePerformance = () => useContext(PerformanceContext);

export default PerformanceContext;
