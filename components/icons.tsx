import React from 'react';

interface IconProps {
  className?: string;
  [key: string]: any;
}

export const RefreshIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.13-4.13M20 15a9 9 0 01-14.13 4.13" />
    </svg>
);

export const LogoIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
);

export const HeroIllustration: React.FC<IconProps> = ({ className, ...props }) => (
    <svg className={className} viewBox="0 0 500 350" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        {/* Shadow filter definition */}
        <defs>
            <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="5" dy="5" stdDeviation="8" floodColor="hsl(var(--foreground))" floodOpacity="0.1"/>
            </filter>
        </defs>

        {/* Background gradient sphere */}
        <radialGradient id="grad-sphere" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
        <circle cx="250" cy="175" r="200" fill="url(#grad-sphere)" />

        {/* Receipt graphic */}
        <g transform="translate(60, 70) rotate(-10 100 100)" style={{ filter: 'url(#hero-shadow)' }}>
            <path d="M0,10C0,4.477,4.477,0,10,0H190c5.523,0,10,4.477,10,10V180 l-15-10 -15,10 -15-10 -15,10 -15-10 -15,10 -15-10 -15,10 -15-10 -15,10 -15-10 -15,10 H0Z" 
                  className="fill-card" />
            <path d="M0,10C0,4.477,4.477,0,10,0H190c5.523,0,10,4.477,10,10V180 l-15-10 -15,10 -15-10 -15,10 -15-10 -15,10 -15-10 -15,10 -15-10 -15,10 -15-10 -15,10 H0Z" 
                  className="stroke-border" />
            
            {/* Abstract content on receipt */}
            <rect x="20" y="20" width="100" height="8" rx="4" className="fill-muted" />
            <rect x="20" y="40" width="160" height="6" rx="3" className="fill-muted opacity-70" />
            <rect x="20" y="55" width="130" height="6" rx="3" className="fill-muted opacity-70" />
            <rect x="20" y="70" width="160" height="6" rx="3" className="fill-muted opacity-70" />
            <rect x="20" y="95" width="80" height="8" rx="4" className="fill-muted" />
            <rect x="140" y="95" width="40" height="8" rx="4" className="fill-primary" />
        </g>
        
        {/* People icons */}
        <g style={{ filter: 'url(#hero-shadow)' }}>
            {/* Person 1 */}
            <circle cx="350" cy="90" r="25" className="fill-card stroke-border" />
            <circle cx="350" cy="70" r="10" className="fill-secondary"/>
            <path d="M335,85 a15,15 0 0,0 30,0" className="fill-card stroke-border" strokeWidth="1"/>

            {/* Person 2 */}
            <circle cx="420" cy="175" r="25" className="fill-card stroke-border" />
            <circle cx="420" cy="155" r="10" className="fill-secondary"/>
            <path d="M405,170 a15,15 0 0,0 30,0" className="fill-card stroke-border" strokeWidth="1"/>

            {/* Person 3 */}
            <circle cx="350" cy="260" r="25" className="fill-card stroke-border" />
            <circle cx="350" cy="240" r="10" className="fill-secondary"/>
            <path d="M335,255 a15,15 0 0,0 30,0" className="fill-card stroke-border" strokeWidth="1"/>
        </g>

        {/* Connector arrow */}
        <path d="M220 175 C 260 175, 280 175, 300 175" className="stroke-primary" strokeWidth="3" strokeDasharray="6 6" />
        <path d="M295 170 l 10 5 l -10 5" className="stroke-primary" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const UploadIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
    </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
    </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
    </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
    </svg>
);

export const SunIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v2m6.364.364l-1.414 1.414M21 12h-2m-1.364 6.364l-1.414-1.414M12 21v-2m-6.364-.364l1.414-1.414M3 12h2m1.364-6.364l1.414 1.414M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
    </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
    </svg>
);

export const ListIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
    </svg>
);

export const FocusIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2z" />
    </svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

export const ColosseumIcon: React.FC<IconProps> = ({
  className,
  'aria-hidden': ariaHidden = true,
  focusable = false,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 490.667 490.667"
    className={className}
    fill="currentColor"
    aria-hidden={ariaHidden}
    focusable={focusable}
    {...props}
  >
    <path d="M74.667,234.825c-17.643,0-32,14.357-32,32v40.107c0,2.923,1.216,5.739,3.349,7.744c1.984,1.877,4.608,2.923,7.317,2.923c0.213,0,0.427,0,0.619-0.021l42.624-2.389c5.653-0.299,10.091-4.971,10.091-10.645v-37.717C106.667,249.183,92.309,234.825,74.667,234.825z M85.333,294.452L64,295.647v-28.821c0-5.867,4.779-10.667,10.667-10.667s10.667,4.8,10.667,10.667V294.452z" />
    <path d="M330.667,224.159c-17.643,0-32,14.357-32,32v44.587c0,5.717,4.501,10.411,10.219,10.667c13.611,0.576,28.011,1.237,42.603,1.941c0.171,0.021,0.341,0.021,0.512,0.021c2.731,0,5.355-1.045,7.36-2.944c2.112-2.005,3.307-4.8,3.307-7.723v-46.549C362.667,238.516,348.309,224.159,330.667,224.159z M341.333,291.508c-7.211-0.341-14.357-0.661-21.333-0.981v-34.368c0-5.867,4.779-10.667,10.667-10.667c5.888,0,10.667,4.8,10.667,10.667V291.508z" />
    <path d="M416,234.825c-17.643,0-32,14.357-32,32v38.016c0,5.675,4.437,10.347,10.112,10.645l42.645,2.261c0.192,0.021,0.384,0.021,0.576,0.021c2.709,0,5.333-1.045,7.339-2.923c2.112-2.005,3.328-4.8,3.328-7.744v-40.277C448,249.183,433.643,234.825,416,234.825z M426.667,295.86l-21.333-1.131v-27.904c0-5.867,4.779-10.667,10.667-10.667s10.667,4.8,10.667,10.667V295.86z" />
    <path d="M490.027,241.801c-24.171-65.664-159.573-70.784-194.325-71.019L276.8,114.121c-1.045-3.115-3.456-5.568-6.571-6.677l-26.091-9.173l-20.992-48.981c-1.621-3.755-5.248-6.251-9.323-6.443c-81.216-3.84-178.581,22.997-212.693,91.2C0.384,135.54,0,137.183,0,138.825v298.667c0,2.944,1.216,5.76,3.371,7.765c1.963,1.877,4.587,2.901,7.296,2.901c0.213,0,0.448,0,0.597-0.021l42.539-2.56c0.043,0,0.107,0,0.149,0l42.624-2.389c0,0,0,0,0.021,0l42.389-2.176c0.064,0,0.128,0,0.192,0c14.4-0.683,28.8-1.323,42.581-1.856c15.339-0.619,29.675-1.067,42.432-1.344c0,0,0,0,0.021,0c14.528-0.32,24.619-0.384,42.112,0.085c12.139,0.32,26.667,0.875,42.517,1.536h0.021h0.021c13.611,0.576,28.011,1.237,42.603,1.941c0.171,0.021,0.341,0.021,0.512,0.021c0.021,0,0.043-0.021,0.064-0.021l41.941,2.091c0.043,0,0.064,0.021,0.107,0.021l42.624,2.261l42.645,2.389c2.944,0.277,5.781-0.875,7.936-2.901c2.133-1.984,3.349-4.8,3.349-7.744v-192C490.667,244.233,490.453,242.996,490.027,241.801z M85.269,422.473L64,423.647v-28.821c0-5.845,4.757-10.645,10.645-10.667c5.867,0.021,10.624,4.8,10.624,10.667V422.473z M170.624,418.228c-6.997,0.299-14.144,0.619-21.291,0.939v-35.008c0-5.867,4.779-10.645,10.645-10.667c5.888,0.021,10.645,4.8,10.645,10.667V418.228z M234.667,416.244v-42.752c0-5.867,4.779-10.645,10.645-10.667c5.888,0.021,10.645,4.8,10.645,10.667v42.795c-3.989-0.085-7.595-0.128-10.624-0.128C242.048,416.159,238.464,416.201,234.667,416.244z M341.291,419.508c-7.189-0.341-14.336-0.661-21.291-0.981v-34.368c0-5.867,4.779-10.645,10.645-10.667c5.888,0.021,10.645,4.8,10.645,10.667V419.508z M426.667,423.86h-0.021l-21.312-1.131v-27.904c0-5.867,4.779-10.667,10.667-10.667s10.667,4.8,10.667,10.667V423.86z M469.333,426.207L448,425.012v-30.187c0-4.416-0.896-8.619-2.517-12.437c-3.243-7.659-9.387-13.803-17.045-17.045c-3.819-1.621-8.043-2.517-12.437-2.517s-8.619,0.896-12.437,2.517c-7.659,3.243-13.803,9.387-17.045,17.045c-1.621,3.819-2.517,8.021-2.517,12.437v26.795l-21.333-1.067v-36.395c0-4.416-0.896-8.619-2.517-12.437c-3.243-7.659-9.387-13.803-17.045-17.045c-3.819-1.621-8.043-2.517-12.437-2.517c-4.395,0-8.619,0.896-12.437,2.517c-7.659,3.243-13.803,9.387-17.045,17.045c-1.621,3.819-2.517,8.021-2.517,12.437v33.472c-7.552-0.32-14.699-0.555-21.333-0.789v-43.349c0-4.416-0.896-8.619-2.517-12.437c-3.243-7.659-9.387-13.803-17.045-17.045c-3.819-1.621-8.043-2.517-12.437-2.517s-8.619,0.896-12.437,2.517c-7.659,3.243-13.803,9.387-17.045,17.045c-1.621,3.819-2.517,8.021-2.517,12.437v43.221c-6.784,0.192-13.909,0.405-21.333,0.683v-33.237c0-4.416-0.896-8.619-2.517-12.437c-3.243-7.659-9.387-13.803-17.045-17.045c-3.819-1.6-8.021-2.517-12.437-2.517c-4.416,0-8.619,0.896-12.437,2.517c-7.659,3.243-13.803,9.387-17.045,17.045c-1.621,3.84-2.517,8.043-2.517,12.437v36.053l-21.333,1.088v-26.475c0-4.416-0.896-8.619-2.517-12.437c-3.243-7.659-9.387-13.803-17.045-17.045c-3.819-1.6-8.021-2.517-12.437-2.517c-4.416,0-8.619,0.896-12.437,2.517c-7.659,3.243-13.803,9.387-17.045,17.045c-1.621,3.84-2.517,8.043-2.517,12.437v30.059l-21.333,1.28V141.407c29.931-56.299,112.555-79.232,184.875-77.504l20.16,47.061c1.173,2.731,3.435,4.843,6.251,5.845l25.579,9.003l19.691,59.051c1.472,4.416,5.056,7.253,10.347,7.296c43.691-1.003,160.832,7.317,181.099,55.36V426.207z" />
    <path d="M245.333,213.492c-17.643,0-32,14.357-32,32v53.632c0,2.859,1.152,5.611,3.2,7.616c2.027,2.005,4.843,3.029,7.68,3.051c14.549-0.32,24.64-0.384,42.155,0.085h0.299c2.773,0,5.44-1.088,7.445-3.029c2.048-1.984,3.221-4.757,3.221-7.637v-53.717C277.333,227.849,262.976,213.492,245.333,213.492z M256,288.286c-4.011-0.085-7.616-0.128-10.667-0.128c-3.285,0-6.869,0.043-10.667,0.085v-42.752c0-5.867,4.779-10.667,10.667-10.667S256,239.625,256,245.492V288.286z" />
    <path d="M160,106.825c-17.643,0-32,14.357-32,32v46.187c0,2.901,1.195,5.696,3.307,7.723c1.984,1.899,4.629,2.944,7.36,2.944c0.171,0,0.341,0,0.512-0.021c14.4-0.683,28.8-1.323,42.581-1.856c5.717-0.235,10.24-4.928,10.24-10.667v-44.309C192,121.183,177.643,106.825,160,106.825z M170.667,172.895c-7.019,0.299-14.165,0.619-21.333,0.939v-35.008c0-5.867,4.779-10.667,10.667-10.667s10.667,4.8,10.667,10.667V172.895z" />
    <path d="M160,224.159c-17.643,0-32,14.357-32,32v46.187c0,2.901,1.195,5.696,3.307,7.723c1.984,1.899,4.629,2.944,7.36,2.944c0.171,0,0.341,0,0.512-0.021c14.4-0.683,28.8-1.323,42.581-1.856c5.717-0.235,10.24-4.928,10.24-10.667v-44.309C192,238.516,177.643,224.159,160,224.159z M170.667,290.228c-7.019,0.299-14.165,0.619-21.333,0.939v-35.008c0-5.867,4.779-10.667,10.667-10.667s10.667,4.8,10.667,10.667V290.228z" />
    <path d="M74.667,117.492c-17.643,0-32,14.357-32,32v40.107c0,2.923,1.216,5.739,3.349,7.744c1.984,1.877,4.608,2.923,7.317,2.923c0.213,0,0.427,0,0.619-0.021l42.624-2.389c5.653-0.299,10.091-4.971,10.091-10.645v-37.717C106.667,131.849,92.309,117.492,74.667,117.492z M85.333,177.119L64,178.313v-28.821c0-5.867,4.779-10.667,10.667-10.667s10.667,4.8,10.667,10.667V177.119z" />
  </svg>
);

export const RandomIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);