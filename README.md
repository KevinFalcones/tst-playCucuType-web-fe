# tst-playCucuType-web-fe
Testing Automation Repo using Playwright + TypeScript + Cucumber (BDD)

# Framework de Automatización E2E (UI + API + DB) - `tst-playcucutype-web-fe`

Este repositorio contiene un framework de pruebas automatizadas End-to-End (E2E) construido bajo el enfoque **BDD (Behavior Driven Development)** utilizando **Playwright**, **Cucumber (Gherkin)** y **TypeScript**, diseñado para validar tanto el Frontend (UI) como el Backend (API REST) del portal `https://automationexercise.com`.

## 📂 Arquitectura y Propósito de Archivos

### Archivos de Configuración Raíz
* **`package.json`**: Define el nombre del proyecto (`tst-playcucutype-web-fe`), gestiona las dependencias del framework (`@playwright/test`, `@cucumber/cucumber`, `typescript`, etc.) y centraliza los scripts de ejecución (`npm test`, `npm run test:ui`, `npm run test:api`) junto con los hooks de ciclo de vida (`pretest` y `posttest`).
* **`tsconfig.json`**: Configura el compilador de TypeScript. Establece las reglas de tipado estricto, la resolución de archivos JSON (para leer datos de prueba) y define el directorio fuente (`rootDir: "./src"`).
* **`cucumber.json`**: Archivo rector de Cucumber. Indica dónde buscar los archivos `.feature` (`paths`), dónde están los pasos implementados y los hooks (`require`), registra el motor de ejecución de TypeScript y define los formatos de salida de reportes (`html`, `json` y `junit.xml` para Azure Pipelines).
* **`.gitignore`**: Evita subir al repositorio de Git carpetas autogeneradas o pesadas (`node_modules/`, `test-results/`, `dist/`) y protege archivos sensibles de variables de entorno locales.

### Capa de Helpers (`src/helper/`)
* **`src/helper/env/.env.qa`**: Almacena las variables de entorno específicas del ambiente de QA (URLs base de Front y API, navegador por defecto, modo headless y credenciales de base de datos). Se separa del código para cambiar de ambiente sin tocar la lógica.
* **`src/helper/env/env.ts`**: Módulo encargado de leer dinámicamente la variable `process.env.ENV` y cargar el archivo `.env.<ambiente>` correspondiente mediante `dotenv` antes de iniciar las pruebas.
* **`src/helper/util/logger.ts`**: Configura la librería `winston` para generar trazabilidad completa. Crea un log tanto en la consola interactiva como en archivos individuales por escenario dentro de `test-results/logs/`, facilitando el debugging en Azure Pipelines.
* **`src/helper/wrapper/PlaywrightWrappers.ts`**: Capa de abstracción sobre las funciones nativas de Playwright (`goto`, `waitAndClick`, `fillText`). Se creó para centralizar esperas explícitas (`waitFor({ state: "visible" })`), evitar código repetitivo en los Steps y hacer que las pruebas sean resistentes a la asincronía del DOM.
* **`src/helper/wrapper/assert.ts`**: Módulo reservado para encapsular aserciones personalizadas o validaciones blandas (*soft assertions*) reutilizables entre UI y API.
* **`src/helper/database/dbHelper.ts`**: Gestiona el pool de conexiones y consultas hacia MySQL (`mysql2`). Permite validar en base de datos que las transacciones hechas por UI o API realmente persistieron, o extraer datos de prueba dinámicos.
* **`src/helper/report/init.ts`**: Script que se ejecuta automáticamente antes de cada prueba (`pretest`). Asegura que la carpeta `test-results/` exista y limpia ejecuciones anteriores para evitar reportes mezclados.
* **`src/helper/report/report.ts`**: Script que se ejecuta al finalizar las pruebas (`posttest`). Consume el archivo `cucumber-report.json` y genera un dashboard HTML gráfico enriquecido con metadatos de ejecución, tiempos y capturas de pantalla usando `multiple-cucumber-html-reporter`.

### Capa de Ciclo de Vida (`src/hooks/`)
* **`src/hooks/pageFixture.ts`**: Objeto compartido (Patrón *Singleton/Context*) que expone la pestaña activa del navegador (`page`), el cliente HTTP (`api`) y el `logger` a través de todos los archivos de Steps sin necesidad de instanciarlos repetidamente.
* **`src/hooks/hooks.ts`**: Controla el ciclo de vida de las pruebas (`BeforeAll`, `Before`, `After`, `AfterAll`). Levanta el navegador Chromium, crea contextos limpios por escenario, **bloquea anuncios publicitarios (Google Ads)** del portal de pruebas para evitar falsos fallos, y toma capturas de pantalla automáticas si un escenario falla.