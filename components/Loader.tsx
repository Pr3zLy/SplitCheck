import React from 'react';

interface LoaderProps {
    message?: string;
    disclaimer?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = "Caricamento...", disclaimer }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center h-12">
                <div className="loader-bar" style={{ animationDelay: '0s' }}></div>
                <div className="loader-bar" style={{ animationDelay: '0.1s' }}></div>
                <div className="loader-bar" style={{ animationDelay: '0.2s' }}></div>
                <div className="loader-bar" style={{ animationDelay: '0.3s' }}></div>
                <div className="loader-bar" style={{ animationDelay: '0.4s' }}></div>
            </div>
            {message && <p className="mt-6 text-muted-foreground tracking-wide">{message}</p>}
            {disclaimer && <p className="mt-2 text-sm text-muted-foreground max-w-xs">{disclaimer}</p>}
        </div>
    );
};

export default Loader;