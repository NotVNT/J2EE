import {useState} from "react";
import {Image, X} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import {useTheme} from "../context/ThemeContext.jsx";

const EmojiPickerPopup = ({icon, onSelect}) => {
    const [isOpen, setIsOpen] = useState(false);
    const {theme} = useTheme();

    const handleEmojiClick = (emoji) => {
        onSelect(emoji?.imageUrl || "");
        setIsOpen(false);
    };
    return (
        <div className="flex flex-col md:flex-row items-start gap-5 mb-6">
            <div
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-4 cursor-pointer"
            >
                <div className="w-12 h-12 flex items-center justify-center text-2xl bg-violet-500/10 text-violet-500 dark:text-violet-400 rounded-lg border border-violet-200 dark:border-violet-500/30">
                    {icon ? (
                        <img src={icon} alt="Icon" className="w-12 h-12" />
                    ) : (
                        <Image size={22} />
                    )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {icon ? "Đổi icon" : "Chọn icon"}
                </p>
            </div>

            {isOpen && (
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full absolute -top-2 -right-2 z-10 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                        <X size={14} />
                    </button>
                    <div className="[&_.epr-main]:bg-slate-800! [&_.epr-emoji-category-label]:bg-slate-800! [&_.epr-emoji-category-label]:text-slate-300! [&_.epr-search]:bg-slate-700! [&_.epr-search]:text-slate-100! [&_.epr-search]:border-white/10! [&_.epr-body]:bg-slate-800! [&_input]:bg-slate-700! [&_input]:text-slate-100!">
                        <EmojiPicker
                            open={isOpen}
                            onEmojiClick={handleEmojiClick}
                            theme={theme === "dark" ? "dark" : "light"}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmojiPickerPopup;
