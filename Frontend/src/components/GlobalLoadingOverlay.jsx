import { useLoading } from "../context/LoadingContext";

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
        {/* Animated spinner ring styled in index.css */}
        <div className="global-spinner-ring" />
        
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
