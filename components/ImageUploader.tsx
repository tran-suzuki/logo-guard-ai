import React, { useCallback, useRef } from 'react';

interface ImageUploaderProps {
  label: string;
  imageSrc: string | null;
  onImageSelected: (base64: string) => void;
  isCapture?: boolean; // If true, uses camera styling (icon)
  allowGallery?: boolean; // If true, allows gallery selection even if isCapture is set
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  label, 
  imageSrc, 
  onImageSelected,
  isCapture = false,
  allowGallery = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerInput = () => {
    inputRef.current?.click();
  };

  // If isCapture is true, we typically force "environment" (rear camera).
  // However, if allowGallery is true, we remove the capture attribute to let the OS 
  // show the standard picker (Camera + Photo Library + Files).
  const captureAttribute = (isCapture && !allowGallery) ? "environment" : undefined;

  // Dynamic text based on mode
  const buttonText = isCapture 
    ? (allowGallery ? "撮影またはアップロード" : "写真を撮影")
    : "ファイルを選択";

  return (
    <div className="flex flex-col w-full h-full">
      <label className="block text-sm font-semibold text-slate-600 mb-2 tracking-wide">
        {label}
      </label>
      
      <div 
        onClick={triggerInput}
        className={`
          relative flex-grow min-h-[200px] md:min-h-[280px]
          border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
          overflow-hidden group
          ${imageSrc ? 'border-accent/50 bg-slate-50' : 'border-slate-300 hover:border-accent hover:bg-slate-50'}
        `}
      >
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={label} 
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-accent transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2">
              {isCapture ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              )}
            </svg>
            <span className="text-sm font-medium">
              {buttonText}
            </span>
          </div>
        )}

        {imageSrc && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
             <span className="bg-white/90 text-slate-800 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
               画像を変更
             </span>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={inputRef}
        className="hidden"
        accept="image/*"
        capture={captureAttribute} 
        onChange={handleFileChange}
      />
    </div>
  );
};