import React from "react";

export function BrandLogo({ id, className = "h-7 w-7" }: { id: string; className?: string }) {
  switch (id.toLowerCase()) {
    case "whatsapp":
    case "evolution":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#E8F8F0" />
          <path
            d="M34.5 13.5C31.7 10.7 28 9.2 24 9.2C15.8 9.2 9.2 15.8 9.2 24C9.2 26.6 9.9 29.2 11.2 31.4L9 39.5L17.3 37.3C19.4 38.5 21.7 39.1 24 39.1C32.2 39.1 38.8 32.5 38.8 24.3C38.8 20.3 37.3 16.3 34.5 13.5Z"
            fill="#25D366"
          />
          <path
            d="M34.5 13.5C31.7 10.7 28 9.2 24 9.2C15.8 9.2 9.2 15.8 9.2 24C9.2 26.6 9.9 29.2 11.2 31.4L9 39.5L17.3 37.3C19.4 38.5 21.7 39.1 24 39.1C32.2 39.1 38.8 32.5 38.8 24.3C38.8 20.3 37.3 16.3 34.5 13.5Z"
            stroke="#25D366"
            strokeWidth="0.5"
          />
          <path
            d="M20.2 16.6C19.8 15.7 19.3 15.7 18.9 15.7C18.6 15.7 18.2 15.7 17.8 15.7C17.4 15.7 16.8 15.9 16.3 16.4C15.8 17 14.4 18.3 14.4 20.9C14.4 23.5 16.3 26 16.6 26.4C16.9 26.8 20.3 32.1 25.5 34.3C29.8 36.1 30.7 35.8 31.6 35.7C32.6 35.6 34.7 34.4 35.1 33.2C35.6 32 35.6 31 35.4 30.7C35.3 30.4 34.9 30.3 34.3 30C33.7 29.7 30.7 28.2 30.1 28C29.6 27.8 29.2 27.7 28.8 28.3C28.4 28.9 27.3 30.3 26.9 30.7C26.6 31.1 26.2 31.2 25.6 30.9C25 30.6 23.1 30 20.8 27.9C19 26.3 17.8 24.3 17.5 23.7C17.2 23.1 17.5 22.8 17.8 22.5C18 22.2 18.3 21.8 18.6 21.5C18.9 21.2 19 20.9 19.2 20.5C19.4 20.1 19.3 19.8 19.2 19.5C19.1 19.2 18 16.6 17.5 15.5"
            fill="white"
          />
        </svg>
      );

    case "facebook":
    case "leadform":
    case "facebook_auth":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#EBF3FF" />
          <rect x="6" y="6" width="36" height="36" rx="10" fill="#1877F2" />
          <path
            d="M29.5 25.5L30.3 20H25V16.4C25 14.9 25.7 13.5 28 13.5H30.5V8.8C29.3 8.6 28.1 8.5 26.9 8.5C23.2 8.5 20.8 10.7 20.8 14.8V20H16V25.5H20.8V39H26.8V25.5H29.5Z"
            fill="white"
          />
        </svg>
      );

    case "google_calendar":
    case "calendar":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#EBF3FF" />
          <rect x="8" y="8" width="32" height="32" rx="8" fill="#1A73E8" />
          <path d="M8 17H40V34C40 37.3 37.3 40 34 40H14C10.7 40 8 37.3 8 34V17Z" fill="white" />
          <text x="24" y="32" fill="#1A73E8" fontSize="16" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
            31
          </text>
          <rect x="14" y="5" width="4" height="6" rx="2" fill="#EA4335" />
          <rect x="30" y="5" width="4" height="6" rx="2" fill="#EA4335" />
        </svg>
      );

    case "gmail":
    case "email":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#FDF2F2" />
          <path d="M12 16L24 25L36 16V33C36 34.1 35.1 35 34 35H14C12.9 35 12 34.1 12 33V16Z" fill="#EA4335" fillOpacity="0.15" />
          <path d="M34 13H14C12.9 13 12 13.9 12 15V17L24 26L36 17V15C36 13.9 35.1 13 34 13Z" fill="#EA4335" />
          <path d="M12 15V33C12 34.1 12.9 35 14 35H18V21.5L12 17V15Z" fill="#4285F4" />
          <path d="M36 15V33C36 34.1 35.1 35 34 35H30V21.5L36 17V15Z" fill="#34A853" />
          <path d="M18 35V21.5L24 26L30 21.5V35H18Z" fill="#FBBC05" />
        </svg>
      );

    case "outlook":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#E8F2FD" />
          <rect x="8" y="10" width="20" height="28" rx="4" fill="#0078D4" />
          <circle cx="18" cy="24" r="5" fill="white" />
          <rect x="22" y="14" width="18" height="20" rx="3" fill="#28A8EA" />
          <path d="M22 17L31 23L40 17V31C40 32.1 39.1 33 38 33H24C22.9 33 22 32.1 22 31V17Z" fill="#0078D4" fillOpacity="0.6" />
        </svg>
      );

    case "google_sheets":
    case "sheets":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#E6F4EA" />
          <rect x="10" y="8" width="28" height="32" rx="4" fill="#0F9D58" />
          <path d="M28 8L38 18H28V8Z" fill="#87CEAC" />
          <rect x="16" y="22" width="16" height="12" rx="1" fill="white" fillOpacity="0.9" />
          <line x1="16" y1="26" x2="32" y2="26" stroke="#0F9D58" strokeWidth="1.5" />
          <line x1="16" y1="30" x2="32" y2="30" stroke="#0F9D58" strokeWidth="1.5" />
          <line x1="22" y1="22" x2="22" y2="34" stroke="#0F9D58" strokeWidth="1.5" />
        </svg>
      );

    case "zapier":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#FFF2EB" />
          <circle cx="24" cy="24" r="16" fill="#FF4A00" />
          <path
            d="M24 13V35M13 24H35M16.2 16.2L31.8 31.8M16.2 31.8L31.8 16.2"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case "twilio":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#FEECEC" />
          <circle cx="24" cy="24" r="16" fill="#F22F46" />
          <circle cx="19" cy="19" r="3" fill="white" />
          <circle cx="29" cy="19" r="3" fill="white" />
          <circle cx="19" cy="29" r="3" fill="white" />
          <circle cx="29" cy="29" r="3" fill="white" />
        </svg>
      );

    case "woocommerce":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#F3EEFB" />
          <rect x="7" y="10" width="34" height="28" rx="8" fill="#96588A" />
          <text x="24" y="28" fill="white" fontSize="11" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            WOO
          </text>
        </svg>
      );

    case "mailchimp":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#FFFCE6" />
          <circle cx="24" cy="24" r="16" fill="#FFE01B" />
          <circle cx="19" cy="22" r="2.5" fill="#241C15" />
          <circle cx="29" cy="22" r="2.5" fill="#241C15" />
          <path d="M18 28C20 31 28 31 30 28" stroke="#241C15" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M15 15C17 13 22 14 24 16C26 14 31 13 33 15" stroke="#241C15" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "stripe":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#F0EEFF" />
          <rect x="8" y="8" width="32" height="32" rx="10" fill="#635BFF" />
          <path
            d="M27.2 20.8C25.5 20.2 24.3 19.8 24.3 18.8C24.3 17.9 25.3 17.3 26.7 17.3C28.4 17.3 30.5 17.9 31.7 18.6V14.4C30.2 13.7 28.5 13.4 26.6 13.4C22.1 13.4 19.2 15.8 19.2 19.4C19.2 24.6 26.2 24.3 26.2 26.7C26.2 27.8 25 28.4 23.6 28.4C21.6 28.4 19.2 27.5 17.6 26.5V30.9C19.4 31.7 21.6 32.2 23.6 32.2C28.3 32.2 31.4 29.9 31.4 26.1C31.4 21.1 27.2 20.8 27.2 20.8Z"
            fill="white"
          />
        </svg>
      );

    case "pabbly":
    case "pabbly_connect":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#EAF8F0" />
          <circle cx="24" cy="24" r="16" fill="#00A859" />
          <path d="M21 16H27C29.8 16 32 18.2 32 21C32 23.8 29.8 26 27 26H24V32H21V16Z" fill="white" />
          <circle cx="25.5" cy="21" r="2.5" fill="#00A859" />
        </svg>
      );

    case "facebook_conversion_api":
    case "meta_capi":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#EBF3FF" />
          <path
            d="M34.8 18.2C33.1 16.5 30.8 15.6 28.4 15.6C25.4 15.6 23.2 17.1 21.5 19.5C19.8 17.1 17.6 15.6 14.6 15.6C12.2 15.6 9.9 16.5 8.2 18.2C4.7 21.7 4.7 27.3 8.2 30.8C9.9 32.5 12.2 33.4 14.6 33.4C17.6 33.4 19.8 31.9 21.5 29.5C23.2 31.9 25.4 33.4 28.4 33.4C30.8 33.4 33.1 32.5 34.8 30.8C38.3 27.3 38.3 21.7 34.8 18.2ZM14.6 30.2C11.5 30.2 9 27.7 9 24.5C9 21.3 11.5 18.8 14.6 18.8C17.7 18.8 20.2 21.3 20.2 24.5C20.2 27.7 17.7 30.2 14.6 30.2ZM28.4 30.2C25.3 30.2 22.8 27.7 22.8 24.5C22.8 21.3 25.3 18.8 28.4 18.8C31.5 18.8 34 21.3 34 24.5C34 27.7 31.5 30.2 28.4 30.2Z"
            fill="#0081FB"
          />
        </svg>
      );

    case "webhook":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#EEF2FF" />
          <rect x="8" y="8" width="32" height="32" rx="10" fill="#4F46E5" />
          <path d="M24 16V22M24 22L19 27M24 22L29 27" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="19" cy="31" r="3" fill="white" />
          <circle cx="29" cy="31" r="3" fill="white" />
          <circle cx="24" cy="14" r="3" fill="white" />
        </svg>
      );

    case "lb_forms":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#F3EEFB" />
          <rect x="8" y="8" width="32" height="32" rx="10" fill="#8B5CF6" />
          <rect x="15" y="14" width="18" height="20" rx="3" fill="white" />
          <line x1="18" y1="19" x2="27" y2="19" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="24" x2="30" y2="24" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="29" x2="25" y2="29" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <div className={`rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs ${className}`}>
          {id.slice(0, 2).toUpperCase()}
        </div>
      );
  }
}
