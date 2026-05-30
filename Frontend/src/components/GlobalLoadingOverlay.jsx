import { useLoading } from "../context/LoadingContext";
import appLogo from "../assets/logo/favicon.png";

const GlobalLoadingOverlay = () => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center global-loading-overlay"
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner ring with logo in center */}
        <div className="global-spinner-wrapper">
          <div className="global-spinner-ring" />
          <img
            src={appLogo}
            alt="Nova Money"
            className="absolute w-8 h-8 rounded-full object-cover"
          />
        </div>
        
        {loadingMessage && (
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 px-4 py-2 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 animate-pulse">
            {loadingMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;
