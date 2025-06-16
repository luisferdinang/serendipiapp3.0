import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno que comiencen con VITE_
  const env = loadEnv(mode, process.cwd(), '');
  
  // Exponer las variables de entorno necesarias para el cliente
  const envWithProcessPrefix = Object.entries(env).reduce(
    (prev, [key, val]) => {
      if (key.startsWith('VITE_') || key.startsWith('FIREBASE_')) {
        return {
          ...prev,
          [`import.meta.env.${key}`]: JSON.stringify(val),
          [`process.env.${key}`]: JSON.stringify(val),
        };
      }
      return prev;
    },
    {}
  );
  
  return {
    define: {
      ...envWithProcessPrefix,
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
      'process.env.VITE_APP_ENV': JSON.stringify(mode),
    },
    plugins: [react()],
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './src') },
        { find: '@components', replacement: path.resolve(__dirname, './components') },
        { find: '@contexts', replacement: path.resolve(__dirname, './contexts') },
        { find: '@hooks', replacement: path.resolve(__dirname, './hooks') },
        { find: '@services', replacement: path.resolve(__dirname, './services') },
        { find: '@types', replacement: path.resolve(__dirname, './types') },
        { find: '@utils', replacement: path.resolve(__dirname, './utils') },
        { find: '@constants', replacement: path.resolve(__dirname, './constants') },
      ]
    },
    server: {
      port: 3000,
      open: true,
    },
    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis',
        },
      },
      include: ['react', 'react-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
    },
  };
});
