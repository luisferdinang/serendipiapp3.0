import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
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
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
  };
});
