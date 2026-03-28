import {Trash2, TrendingDown, TrendingUp} from "lucide-react";
import {addThousandsSeparator} from "../util/util.js";
import {hasDisplayImage, hideBrokenImageWrapper} from "../util/imageDisplay.js";

const TransactionInfoCard = ({icon, title, date, amount, type, hideDeleteBtn, onDelete, category, receiptLocation}) => {
    const getAmountStyles = () => type === 'income'? 'bg-green-50  text-green-800': 'bg-red-50 text-red-800';
    const shouldShowImage = hasDisplayImage(icon) && !receiptLocation;

    return (
        <div className="group relative flex items-center gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/60">
            {shouldShowImage ? (
                <div
                    data-image-wrapper="true"
                    className="w-12 h-12 flex shrink-0 items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full"
                >
                    <img
                        src={icon}
                        alt={title}
                        className="w-6 h-6 object-contain"
                        onError={hideBrokenImageWrapper}
                    />
                </div>
            ) : null}

            <div className="flex-1 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-700 font-medium">{title}</p>
                    <p className="text-xs text-gray-400 mt-1">{category && <span className="text-gray-500">{category} • </span>}{date}</p>
                    {receiptLocation ? (
                        <p className="text-xs text-sky-700 mt-1">Hóa đơn</p>
                    ) : null}
                </div>

                <div className="flex items-center gap-2">
                    {!hideDeleteBtn && (
                        <button
                            onClick={onDelete}
                            className="text-gray-400 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Trash2 size={18} />
                        </button>
                    )}

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${getAmountStyles()}`}>
                        <h6 className="text-xs font-medium">
                            {type === 'income' ? '+ ': '- '}{addThousandsSeparator(amount)} VND
                        </h6>
                        {type === 'income'? (
                            <TrendingUp size={15} />
                        ) : (
                            <TrendingDown size={15}/>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TransactionInfoCard;
