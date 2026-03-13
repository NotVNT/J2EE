import { useRef, useState } from "react";
import { Camera, Trash2, User } from "lucide-react";

const ProfilePhotoSelector = ({ image, setImage }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  return (
    <div className="flex justify-center">
      <input
        ref={inputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
        type="file"
      />
      {!image ? (
        <button
          className="relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-500"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <User size={36} />
          <span className="absolute bottom-0 right-0 rounded-full bg-slate-900 p-2 text-white">
            <Camera size={14} />
          </span>
        </button>
      ) : (
        <div className="relative">
          <img alt="preview" className="h-24 w-24 rounded-full object-cover" src={previewUrl} />
          <button
            className="absolute bottom-0 right-0 rounded-full bg-red-600 p-2 text-white"
            onClick={handleRemoveImage}
            type="button"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoSelector;
