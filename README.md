# Serendipia Studio Finance Manager

Aplicación de gestión financiera con autenticación de Firebase y tema oscuro.

## Requisitos Previos

- Node.js 18 o superior
- npm 8 o superior
- Cuenta de Firebase
- Variables de entorno configuradas

## Configuración del Entorno Local

1. Clona el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd serendipia-superapp
   ```

2. Instala las dependencias:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configura las variables de entorno:
   - Copia el archivo `.env.example` a `.env.local`
   - Configura tus claves de Firebase y otras variables necesarias

4. Inicia la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción localmente
- `npm run lint` - Ejecuta el linter
- `npm run type-check` - Verifica los tipos de TypeScript

## Despliegue en Netlify

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno en la configuración de Netlify
3. Asegúrate de que la configuración de construcción sea:
   - Comando de construcción: `npm install --legacy-peer-deps && npm run build`
   - Directorio de publicación: `dist`

## Estructura del Proyecto

- `/components` - Componentes reutilizables de React
- `/pages` - Páginas de la aplicación
- `/services` - Servicios y lógica de negocio
- `/contexts` - Contextos de React para el estado global
- `/hooks` - Custom hooks de React
- `/types` - Definiciones de tipos de TypeScript
- `/utils` - Utilidades y funciones auxiliares

## Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_dominio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.
