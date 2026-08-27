import React from 'react';
import { Language, translations } from '../utils/translations';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  language?: Language;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  showText = true, 
  size = 'md',
  language = 'EN'
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl md:text-2xl',
    lg: 'text-3xl'
  };

  const t = translations[language] || translations.EN;

  return (
    <div id="easyhssab-logo-container" className={`flex items-center gap-3 ${className}`}>
      {/* Smart vector brand mark: steaming Moroccan coffee glass integrated with accounting bars */}
      <div 
        id="easyhssab-logo-icon"
        className={`${iconSizes[size]} bg-[#1A1A1A] rounded-2xl flex items-center justify-center text-[#C4A484] border-[1.5px] border-[#1A1A1A] shadow-[2.5px_2.5px_0px_0px_rgba(196,164,132,1)] shrink-0 transition-transform hover:scale-105`}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-1/2 h-1/2"
        >
          {/* Coffee/Tea Glass Cup Body */}
          <path d="M6 8 L8 21 C8 21.5 8.5 22 9 22 L15 22 C15.5 22 16 21.5 16 21 L18 8 Z" stroke="#C4A484" />
          
          {/* Accounting Ledger Grid Lines / Steaming Heat */}
          <path d="M9 4 C9 2.5 10 2.5 10 1" stroke="#F3F1ED" strokeWidth="1.5" />
          <path d="M12 5 C12 3.5 13 3.5 13 1.5" stroke="#C4A484" strokeWidth="1.5" />
          <path d="M15 4.5 C15 3 16 3 16 1.2" stroke="#F3F1ED" strokeWidth="1.5" />
          
          {/* Inside Coffee level and Math/Audit Percentage Sign */}
          <path d="M7.5 13 L16.5 13" stroke="#C4A484" strokeWidth="1" strokeDasharray="1 1" />
          
          {/* Accounting Chart Bars / Percent Accents */}
          <circle cx="10" cy="10" r="1.2" fill="#C4A484" stroke="none" />
          <line x1="9.5" y1="16.5" x2="14.5" y2="10.5" stroke="#C4A484" strokeWidth="1.5" />
          <circle cx="14" cy="17" r="1.2" fill="#C4A484" stroke="none" />
        </svg>
      </div>

      {showText && (
        <div id="easyhssab-logo-wordmark" className="flex flex-col">
          <div className="flex items-center">
            <h1 className={`${textSizes[size]} font-serif font-black text-[#1A1A1A] leading-none tracking-tight flex items-center`}>
              Easy<span className="text-[#C4A484] font-sans font-extrabold ml-0.5">Hssab</span>
            </h1>
            <span className="ml-1.5 inline-block bg-[#1A1A1A] text-[#C4A484] text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border border-black">
              {t.saasVersion}
            </span>
          </div>
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#8C7B6E] mt-0.5">
            {t.tagline}
          </p>
        </div>
      )}
    </div>
  );
};
