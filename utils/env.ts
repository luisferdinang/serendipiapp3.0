/**
 * Utilidad para acceder de forma segura a las variables de entorno
 * Proporciona valores por defecto y validación básica
 */

// Tipos para las variables de entorno
type EnvVariables = {
  // Firebase
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_MEASUREMENT_ID?: string;
  
  // App
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
  VITE_APP_ENV: 'development' | 'staging' | 'production';
  
  // API
  VITE_API_BASE_URL: string;
  
  // Feature Flags
  VITE_ENABLE_ANALYTICS: boolean;
  VITE_ENABLE_DEBUG_MODE: boolean;
  
  // Internationalization
  VITE_DEFAULT_LANGUAGE: string;
  VITE_SUPPORTED_LANGUAGES: string[];
  
  // Theme
  VITE_DEFAULT_THEME: string;
  
  // Pagination
  VITE_ITEMS_PER_PAGE: number;
  
  // Date & Time
  VITE_DATE_FORMAT: string;
  VITE_TIME_FORMAT: string;
  VITE_DATE_TIME_FORMAT: string;
  
  // Currency
  VITE_DEFAULT_CURRENCY: string;
  VITE_CURRENCY_SYMBOL: string;
  VITE_CURRENCY_DECIMALS: number;
  
  // Exchange Rate
  VITE_DEFAULT_EXCHANGE_RATE: number;
  
  // Storage Keys
  VITE_AUTH_TOKEN_KEY: string;
  VITE_USER_DATA_KEY: string;
  VITE_THEME_KEY: string;
  VITE_LANGUAGE_KEY: string;
};

// Valores por defecto para desarrollo
const defaultEnv: EnvVariables = {
  // Firebase - estos deben ser reemplazados en producción
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
  VITE_FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  
  // App
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'Serendipia',
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  VITE_APP_ENV: (import.meta.env.VITE_APP_ENV as 'development' | 'staging' | 'production') || 'development',
  
  // API
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // Feature Flags
  VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  VITE_ENABLE_DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE !== 'false',
  
  // Internationalization
  VITE_DEFAULT_LANGUAGE: import.meta.env.VITE_DEFAULT_LANGUAGE || 'es',
  VITE_SUPPORTED_LANGUAGES: (import.meta.env.VITE_SUPPORTED_LANGUAGES || 'es,en').split(','),
  
  // Theme
  VITE_DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'system',
  
  // Pagination
  VITE_ITEMS_PER_PAGE: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE || '10', 10),
  
  // Date & Time
  VITE_DATE_FORMAT: import.meta.env.VITE_DATE_FORMAT || 'DD/MM/YYYY',
  VITE_TIME_FORMAT: import.meta.env.VITE_TIME_FORMAT || 'HH:mm',
  VITE_DATE_TIME_FORMAT: import.meta.env.VITE_DATE_TIME_FORMAT || 'DD/MM/YYYY HH:mm',
  
  // Currency
  VITE_DEFAULT_CURRENCY: import.meta.env.VITE_DEFAULT_CURRENCY || 'BS',
  VITE_CURRENCY_SYMBOL: import.meta.env.VITE_CURRENCY_SYMBOL || 'Bs.',
  VITE_CURRENCY_DECIMALS: parseInt(import.meta.env.VITE_CURRENCY_DECIMALS || '2', 10),
  
  // Exchange Rate
  VITE_DEFAULT_EXCHANGE_RATE: parseFloat(import.meta.env.VITE_DEFAULT_EXCHANGE_RATE || '36.5'),
  
  // Storage Keys
  VITE_AUTH_TOKEN_KEY: import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token',
  VITE_USER_DATA_KEY: import.meta.env.VITE_USER_DATA_KEY || 'user_data',
  VITE_THEME_KEY: import.meta.env.VITE_THEME_KEY || 'theme_preference',
  VITE_LANGUAGE_KEY: import.meta.env.VITE_LANGUAGE_KEY || 'language_preference',
};

// Validar variables de entorno requeridas en producción
const validateEnv = (): void => {
  if (import.meta.env.PROD) {
    const requiredVars: (keyof EnvVariables)[] = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID',
    ];

    const missingVars = requiredVars.filter(
      (key) => !import.meta.env[key] || import.meta.env[key] === ''
    );

    if (missingVars.length > 0) {
      console.error(
        `Error: Las siguientes variables de entorno son requeridas pero no están definidas:\n${missingVars.join('\n')}`
      );
      if (import.meta.env.PROD) {
        throw new Error('Configuración de entorno incompleta');
      }
    }
  }
};

// Validar al cargar el módulo
validateEnv();

// Exportar las variables de entorno con tipos
export const env: EnvVariables = {
  ...defaultEnv,
};

// Utilidad para acceder a las variables de entorno con tipado seguro
export function getEnv<T extends keyof EnvVariables>(key: T): EnvVariables[T] {
  const value = env[key];
  
  if (value === undefined) {
    if (import.meta.env.DEV) {
      console.warn(`La variable de entorno ${key} no está definida`);
    }
    throw new Error(`La variable de entorno ${key} no está definida`);
  }
  
  return value;
}

// Helper para verificar si estamos en desarrollo
export const isDev = (): boolean => env.VITE_APP_ENV === 'development';

// Helper para verificar si estamos en producción
export const isProd = (): boolean => env.VITE_APP_ENV === 'production';

// Helper para verificar si estamos en staging
export const isStaging = (): boolean => env.VITE_APP_ENV === 'staging';

// Helper para obtener el nombre de la aplicación
export const getAppName = (): string => env.VITE_APP_NAME;

// Helper para obtener la versión de la aplicación
export const getAppVersion = (): string => env.VITE_APP_VERSION;

export default env;
