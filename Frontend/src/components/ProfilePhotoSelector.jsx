import {useEffect, useRef, useState} from "react";
import {Trash, Upload, User} from "lucide-react";

const ProfilePhotoSelector = ({image, setImage, currentImageUrl = "", onRemoveCurrentImage}) => {
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (!image) {
            setPreviewUrl(null);
        }
    }, [image]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }

    const handleRemoveImage = (e) => {
        e.preventDefault();
        setImage(null);
        setPreviewUrl(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        onRemoveCurrentImage?.();
    }

    const onChooseFile = (e) => {
        e.preventDefault();
        inputRef.current?.click();
    }

    const displayedImage = previewUrl || currentImageUrl;

    return (
        <div className="flex justify-center mb-6">
            <input
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={handleImageChange}
                className="hidden"
            />

            {!displayedImage ? (
                <div className="w-20 h-20 flex items-center justify-center bg-purple-100 rounded-full relative">
                    <User className="text-purple-500" size={35} />

                    <button
                        onClick={onChooseFile}
                        className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -bottom-1 -right-1"
                    >
                        <Upload size={15} className="text-purple-500" />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <img src={displayedImage} alt="profile photo" className="w-20 h-20 rounded-full object-cover" />
                    <button
                        onClick={handleRemoveImage}
                        className="w-8 h-8 flex items-center justify-center bg-red-800 text-white rounded-full absolute -bottom-1 -right-1"
                    >
                        <Trash size={15}/>
                    </button>
                </div>
            )}
        </div>
    )
}

export default ProfilePhotoSelector;
