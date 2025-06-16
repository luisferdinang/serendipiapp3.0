// Título de la aplicación
export const APP_TITLE = 'Serendipia';

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  // Agrega más rutas según sea necesario
};

// Configuración de Firestore
export const FIRESTORE_COLLECTIONS = {
  TRANSACTIONS: 'transactions',
  USERS: 'users',
  // Agrega más colecciones según sea necesario
};

// Configuración de autenticación
export const AUTH = {
  MIN_PASSWORD_LENGTH: 6,
  PASSWORD_ERROR_MESSAGES: {
    TOO_SHORT: 'La contraseña debe tener al menos 6 caracteres',
    WEAK_PASSWORD: 'La contraseña es demasiado débil',
    INVALID_EMAIL: 'El correo electrónico no es válido',
    EMAIL_ALREADY_IN_USE: 'Este correo ya está en uso',
    USER_NOT_FOUND: 'No existe una cuenta con este correo',
    WRONG_PASSWORD: 'Contraseña incorrecta',
    TOO_MANY_ATTEMPTS: 'Demasiados intentos. Por favor, inténtalo más tarde',
  },
};

// Configuración de monedas
export const CURRENCY = {
  BS: 'Bs.',
  USD: 'USD',
};

// Configuración de tipos de transacciones
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  ADJUSTMENT: 'adjustment',
} as const;

// Configuración de métodos de pago
export const PAYMENT_METHODS = {
  CASH: 'Efectivo',
  BANK_TRANSFER: 'Transferencia Bancaria',
  DEBIT_CARD: 'Tarjeta de Débito',
  CREDIT_CARD: 'Tarjeta de Crédito',
  CRYPTO: 'Criptomonedas',
  OTHER: 'Otro',
} as const;

// Configuración de categorías de transacciones
export const TRANSACTION_CATEGORIES = {
  // Ingresos
  SALARY: 'Salario',
  FREELANCE: 'Trabajo Independiente',
  INVESTMENT: 'Inversiones',
  GIFT: 'Regalos',
  OTHER_INCOME: 'Otros Ingresos',
  
  // Gastos
  FOOD: 'Alimentación',
  TRANSPORT: 'Transporte',
  HOUSING: 'Vivienda',
  UTILITIES: 'Servicios Públicos',
  HEALTH: 'Salud',
  EDUCATION: 'Educación',
  ENTERTAINMENT: 'Entretenimiento',
  SHOPPING: 'Compras',
  TRAVEL: 'Viajes',
  SUBSCRIPTIONS: 'Suscripciones',
  OTHER_EXPENSE: 'Otros Gastos',
  
  // Ajustes
  CURRENCY_ADJUSTMENT: 'Ajuste por Tasa de Cambio',
  CORRECTION: 'Corrección',
  OTHER_ADJUSTMENT: 'Otro Ajuste',
} as const;

// Configuración de temas
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Configuración de idiomas
export const LANGUAGES = {
  ES: 'es',
  EN: 'en',
} as const;
