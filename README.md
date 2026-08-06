# Avatar Interview Coach

Proyecto Integrador (PIM3 - Full Stack, Henry) — Single Page Application que permite chatear
con un personaje ficticio usando inteligencia artificial, con routing básico y una función
serverless en Vercel que protege la API key.

## Personaje elegido: Avatar Aang

El personaje es **Aang**, el Avatar y último maestro aire de la serie *Avatar: La Leyenda de
Aang*. En esta aplicación, Aang actúa como **entrenador de entrevistas laborales**: usa la
filosofía de los cuatro elementos (agua, tierra, fuego, aire) como metáforas de soft skills
(comunicación, confianza, liderazgo, adaptabilidad) para ayudar a la persona usuaria a
prepararse para una entrevista de trabajo.

- Tono cálido, sabio y con humor ligero, propio del personaje.
- Respuestas cortas y conversacionales, pensadas para chat (no ensayos largos).
- Mantiene el contexto de la conversación mientras dura la sesión.

## Stack técnico

- **Frontend:** HTML + CSS + JavaScript vanilla (sin frameworks), Vite como servidor de
  desarrollo y bundler.
- **Routing:** SPA con History API (`pushState` / `popstate`), sin recargas de página.
- **Backend:** Vercel Serverless Function (`api/chat.js`) que actúa como proxy seguro hacia
  la IA, para no exponer la API key en el cliente.
- **Proveedor de IA:** [OpenRouter](https://openrouter.ai) (modelo `openai/gpt-oss-20b:free`),
  usado en lugar de la API directa de Gemini para evitar fricciones de SDK/autenticación del
  lado del proveedor — decisión validada como aceptable para este PI.
- **Tests:** [Vitest](https://vitest.dev) + `jsdom` (para pruebas de DOM/routing) con `fetch`
  mockeado en los tests de la función serverless (sin llamadas de red reales).

## Requisitos

- Node.js 18 o superior (se usa `fetch` global, disponible desde Node 18).
- Una cuenta de [OpenRouter](https://openrouter.ai/keys) con una API key.
- [Vercel CLI](https://vercel.com/docs/cli) (se instala como dependencia de desarrollo del
  proyecto, no hace falta instalarla global).

## Ejecutar en local

1. **Clonar el repositorio e instalar dependencias:**

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd avatar-mentor
   npm install
   ```

2. **Configurar las variables de entorno:**

   Copiá el archivo de ejemplo y completá tu API key real de OpenRouter:

   ```bash
   cp .env.example .env
   ```

   Editá `.env` y reemplazá el valor de ejemplo:

   ```
   OPENROUTER_API_KEY=tu_api_key_real_de_openrouter
   ```

3. **Levantar el proyecto con `vercel dev`:**

   La aplicación necesita correr con `vercel dev` (y no solo `npm run dev` / `vite`) para que
   la serverless function de `api/chat.js` esté disponible localmente:

   ```bash
   npx vercel dev
   ```

   La primera vez te va a pedir vincular el proyecto (podés aceptar los valores por defecto).
   Por defecto queda disponible en `http://localhost:3000`.

4. Abrí esa URL en el navegador y navegá a **Comenzar Entrenamiento** para chatear con Aang.

## Cómo ejecutar los tests

El proyecto usa Vitest. Para correr toda la suite una vez:

```bash
npm test
```

Esto ejecuta 4 archivos de test (32 casos en total):

- `tests/utils.test.js` — funciones puras de transformación/validación de datos.
- `tests/api.test.js` — lógica de construcción de mensajes (system prompt + historial) y el
  handler de `api/chat.js`, con `fetch` mockeado (sin red real).
- `tests/app.test.js` — routing SPA (History API) usando `jsdom`.
- `tests/chat.test.js` — envío de mensajes, renderizado y el estado visual de error, con
  `fetch` mockeado.

También podés usar la UI interactiva de Vitest:

```bash
npm run test:ui
```

## Cómo desplegar a Vercel

1. Instalá y autenticá la CLI de Vercel (una sola vez):

   ```bash
   npx vercel login
   ```

2. Vinculá el proyecto (si todavía no está vinculado):

   ```bash
   npx vercel link
   ```

3. Configurá la variable de entorno en Vercel (Dashboard → tu proyecto → **Settings** →
   **Environment Variables**), agregando `OPENROUTER_API_KEY` con tu key real, para los
   entornos *Production*, *Preview* y *Development*.

4. Desplega:

   ```bash
   npx vercel --prod
   ```

   Si el repositorio está conectado a GitHub (como en este proyecto), cada `git push` a la
   rama principal dispara automáticamente un nuevo deploy.

## Capturas de pantalla

> Agregá tus capturas en `docs/screenshots/` con estos nombres y se van a ver acá abajo:

| Home | Chat | About |
|---|---|---|
| ![Home](docs/screenshots/home.png) | ![Chat](docs/screenshots/chat.png) | ![About](docs/screenshots/about.png) |

## Aplicación desplegada

🔗 https://avatar-interview-coach.vercel.app

## Registro del uso de IA en el proyecto

Este proyecto se desarrolló con asistencia de Claude Code (Anthropic) como herramienta de
pair-programming. Uso concreto:

- **Diagnóstico de bugs:** la función serverless (`api/chat.js`) estaba vacía y no funcionaba.
  Con ayuda de la IA se identificó que la causa raíz era un conflicto entre `"type": "module"`
  en `package.json` (ESM) y el uso de `module.exports` (CommonJS) en la function, y se corrigió
  usando `export default`.
- **Diseño del system prompt:** se iteró junto a la IA sobre el prompt de personalidad de Aang
  (tono, longitud de respuesta, límites del personaje) y se ajustó `temperature` para reducir
  respuestas erráticas del modelo gratuito.
- **Corrección de flujo de contexto:** se detectó y corrigió que el historial de la conversación
  no se estaba enviando al modelo (solo se guardaba en el cliente), rompiendo la memoria
  conversacional pedida en la consigna.
- **Escritura de tests:** los 28 tests (Vitest + jsdom, con `fetch` mockeado) fueron escritos con
  asistencia de IA, cubriendo utils, la función serverless y el routing SPA.
- **Revisión de dependencias externas:** se verificó contra la documentación pública de
  OpenRouter qué modelos gratuitos estaban disponibles, ya que el modelo originalmente usado
  (`mistralai/mistral-7b-instruct:free`) ya no existía.

Todo el código generado fue revisado, probado localmente (`vercel dev` + `curl` + Vitest) y
ajustado manualmente antes de integrarlo al proyecto.
