import React, { useState, useCallback, DragEvent } from 'react';
import { UploadIcon } from './icons';

interface AppendReceiptUploadProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

const AppendReceiptUpload: React.FC<AppendReceiptUploadProps> = ({ onFileUpload, disabled }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFile = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
  };

  return (
    <div onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}>
        <label
            htmlFor="append-receipt-file"
            className={`px-4 py-2 border-2 border-dashed rounded-md transition-colors flex items-center gap-2 text-sm w-full sm:w-auto justify-center
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <input id="append-receipt-file" type="file" className="hidden" onChange={handleChange} accept="image/*" disabled={disabled} />
            <UploadIcon className="w-5 h-5 text-muted-foreground" />
            {isDragActive ? (
                <span className="font-semibold text-primary">Rilascia qui</span>
            ) : (
                <span className="text-muted-foreground whitespace-nowrap">Aggiungi scontrino</span>
            )}
        </label>
    </div>
  );
};

export default AppendReceiptUpload;
