import {Pencil} from "lucide-react";
import {hasDisplayImage, hideBrokenImageWrapper} from "../util/imageDisplay.js";

const CategoryList = ({categories, onEditCategory}) => {
    return (
        <div className="card p-4">
            <div className="flex items-center justify-between text-slate-900 mb-4 border-b border-gray-200 pb-2">
                <h4 className="text-lg font-semibold">Nguồn danh mục</h4>
            </div>

            {/* Category list */}
            {categories.length === 0 ? (
                <p className="text-gray-500">Chưa có danh mục nào. Hãy thêm danh mục để bắt đầu!</p>
            ): (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="group relative flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100/60">
                            {hasDisplayImage(category.icon) ? (
                                <div
                                    data-image-wrapper="true"
                                    className="w-12 h-12 flex shrink-0 items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full"
                                >
                                    <img
                                        src={category.icon}
                                        alt={category.name}
                                        className="h-5 w-5 object-contain"
                                        onError={hideBrokenImageWrapper}
                                    />
                                </div>
                            ) : null}


                            {/* Category Details*/}
                            <div className="flex-1 flex items-center justify-between">
                                {/* Category name and type*/}
                                <div>
                                    <p className="text-sm text-gray-700 font-medium">
                                        {category.name}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1 capitalize">
                                        {category.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                                    </p>
                                </div>
                                {/* Action buttons*/}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEditCategory(category)}
                                        className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Pencil size={18} />
                                    </button>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CategoryList;
