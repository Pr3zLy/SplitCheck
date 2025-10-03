import React, { useState, useCallback, DragEvent } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  language: 'it' | 'en';
}

const translations = {
    it: {
        dropHere: "Rilascia l'immagine qui",
        dragOrClick: "Trascina qui l'immagine dello scontrino",
        selectFile: "o clicca per selezionarla",
        supportedFiles: "File supportati: JPG, PNG, WEBP",
    },
    en: {
        dropHere: "Drop the image here",
        dragOrClick: "Drag and drop the receipt image here",
        selectFile: "or click to select it",
        supportedFiles: "Supported files: JPG, PNG, WEBP",
    }
};

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, language }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const t = translations[language];

  const handleFile = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
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
            htmlFor="dropzone-file"
            className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center text-center
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
        >
            <input id="dropzone-file" type="file" className="hidden" onChange={handleChange} accept="image/*" />
            <UploadIcon className="w-12 h-12 text-muted-foreground mb-4" />
            {isDragActive ? (
            <p className="text-primary font-semibold">{t.dropHere}</p>
            ) : (
            <>
                <p className="font-semibold text-foreground">{t.dragOrClick}</p>
                <p className="text-muted-foreground">{t.selectFile}</p>
                <p className="text-xs text-muted-foreground mt-2">{t.supportedFiles}</p>
            </>
            )}
        </label>
    </div>
  );
};

export default FileUpload;
