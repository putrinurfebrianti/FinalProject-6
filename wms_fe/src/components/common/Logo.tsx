import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", showText = true }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo SVG - Herbaflow Smart Inventory */}
      <div className="relative">
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10"
        >
          {/* Warehouse/House Shape */}
          <path 
            d="M50 10 L90 35 L90 40 L10 40 L10 35 Z" 
            fill="#658354"
            className="fill-herbalife-600"
          />
          
          {/* Main Building */}
          <rect 
            x="20" 
            y="40" 
            width="60" 
            height="50" 
            fill="#75975e"
            className="fill-herbalife-500"
          />
          
          {/* Door */}
          <rect 
            x="42" 
            y="60" 
            width="16" 
            height="30" 
            fill="#4b6043"
            className="fill-herbalife-700"
          />
          
          {/* Windows - Left */}
          <rect x="28" y="48" width="10" height="8" fill="#b3cf99" className="fill-herbalife-200" />
          <rect x="28" y="60" width="10" height="8" fill="#b3cf99" className="fill-herbalife-200" />
          
          {/* Windows - Right */}
          <rect x="62" y="48" width="10" height="8" fill="#b3cf99" className="fill-herbalife-200" />
          <rect x="62" y="60" width="10" height="8" fill="#b3cf99" className="fill-herbalife-200" />
          
          {/* Door lines */}
          <line x1="50" y1="60" x2="50" y2="90" stroke="#658354" strokeWidth="2" />
          <line x1="42" y1="75" x2="58" y2="75" stroke="#658354" strokeWidth="1" />
        </svg>
        
        {/* Green dots decoration */}
        <div className="absolute w-2 h-2 rounded-full -left-2 top-1/2 bg-herbalife-400 animate-pulse"></div>
        <div className="absolute w-2 h-2 rounded-full -right-2 top-1/2 bg-herbalife-400 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-wider text-herbalife-700 dark:text-herbalife-300">
            HERBAFLOW
          </span>
          <span className="text-xs tracking-wide text-herbalife-600 dark:text-herbalife-400">
            SMART INVENTORY
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;