/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Firebase
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  
  // App
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
  
  // API
  readonly VITE_API_BASE_URL: string;
  
  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_DEBUG_MODE: string;
  
  // Internationalization
  readonly VITE_DEFAULT_LANGUAGE: string;
  readonly VITE_SUPPORTED_LANGUAGES: string;
  
  // Theme
  readonly VITE_DEFAULT_THEME: string;
  
  // Pagination
  readonly VITE_ITEMS_PER_PAGE: string;
  
  // Date & Time
  readonly VITE_DATE_FORMAT: string;
  readonly VITE_TIME_FORMAT: string;
  readonly VITE_DATE_TIME_FORMAT: string;
  
  // Currency
  readonly VITE_DEFAULT_CURRENCY: string;
  readonly VITE_CURRENCY_SYMBOL: string;
  readonly VITE_CURRENCY_DECIMALS: string;
  
  // Exchange Rate
  readonly VITE_DEFAULT_EXCHANGE_RATE: string;
  
  // Storage Keys
  readonly VITE_AUTH_TOKEN_KEY: string;
  readonly VITE_USER_DATA_KEY: string;
  readonly VITE_THEME_KEY: string;
  readonly VITE_LANGUAGE_KEY: string;
  
  // Gemini API
  readonly VITE_GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
