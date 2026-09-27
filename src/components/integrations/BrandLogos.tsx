import React from "react";

export function BrandLogo({ id, className = "h-7 w-7" }: { id: string; className?: string }) {
  const normId = id.toLowerCase();
  
  if (normId === "zapier") {
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
  }

  if (normId === "outlook") {
    return (
      <svg className={className} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#E8F2FD" />
        <rect x="8" y="10" width="20" height="28" rx="4" fill="#0078D4" />
        <circle cx="18" cy="24" r="5" fill="white" />
        <rect x="22" y="14" width="18" height="20" rx="3" fill="#28A8EA" />
        <path d="M22 17L31 23L40 17V31C40 32.1 39.1 33 38 33H24C22.9 33 22 32.1 22 31V17Z" fill="#0078D4" fillOpacity="0.6" />
      </svg>
    );
  }

  if (normId === "woocommerce") {
    return (
      <svg className={className} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#F3EEFB" />
        <rect x="7" y="10" width="34" height="28" rx="8" fill="#96588A" />
        <text x="24" y="28" fill="white" fontSize="11" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
          WOO
        </text>
      </svg>
    );
  }

  if (normId === "mailchimp") {
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
  }

  if (normId === "pabbly" || normId === "pabbly_connect") {
    return (
      <svg className={className} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#EAF8F0" />
        <circle cx="24" cy="24" r="16" fill="#00A859" />
        <path d="M21 16H27C29.8 16 32 18.2 32 21C32 23.8 29.8 26 27 26H24V32H21V16Z" fill="white" />
        <circle cx="25.5" cy="21" r="2.5" fill="#00A859" />
      </svg>
    );
  }

  if (normId === "webhook") {
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
  }

  if (normId === "lb_forms") {
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
  }

  if (normId === "intercom") {
    return (
      <svg className={className} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#EBF4FF" />
        <circle cx="24" cy="24" r="16" fill="#0050FF" />
        <rect x="20" y="27" width="8" height="3" rx="1.5" fill="white" />
        <circle cx="20" cy="21" r="2" fill="white" />
        <circle cx="28" cy="21" r="2" fill="white" />
      </svg>
    );
  }

  if (normId === "activecampaign") {
    return (
      <svg className={className} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#EBF4FF" />
        <circle cx="24" cy="24" r="16" fill="#356AE6" />
        <path d="M24 14 L26.5 21.5 L34 24 L26.5 26.5 L24 34 L21.5 26.5 L14 24 L21.5 21.5 Z" fill="white" />
      </svg>
    );
  }

  const logos: Record<string, string> = {
    whatsapp: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    evolution: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    facebook: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg",
    leadform: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg",
    facebook_auth: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg",
    google_calendar: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
    calendar: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
    gmail: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg",
    email: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg",
    google_sheets: "https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg",
    sheets: "https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg",
    twilio: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Twilio-logo-red.svg",
    stripe: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    facebook_conversion_api: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    meta_capi: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    hubspot: "https://upload.wikimedia.org/wikipedia/commons/3/3f/HubSpot_Logo.svg",
    salesforce: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
    calendly: "https://cdn.iconscout.com/icon/free/png-256/free-calendly-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-company-brand-vol-2-pack-logos-icons-2944747.png?f=webp",
    zoom: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg",
    slack: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
    shopify: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg",
    razorpay: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
    linkedin: "https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg"
  };

  const url = logos[normId];
  const scaleLogos = ["shopify", "razorpay", "hubspot", "meta_capi", "facebook_conversion_api"];
  const shouldScale = scaleLogos.includes(normId);

  if (url) {
    return (
      <img 
        src={url} 
        alt={`${id} logo`} 
        className={className} 
        style={{ 
          objectFit: 'contain', 
          transform: shouldScale ? 'scale(1.4)' : 'none' 
        }} 
      />
    );
  }

  // Fallback for missing
  return (
    <div className={`rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs ${className}`}>
      {id.slice(0, 2).toUpperCase()}
    </div>
  );
}
