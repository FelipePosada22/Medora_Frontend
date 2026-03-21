# E2E Tests — Medora Frontend

Suite de pruebas end-to-end con [Playwright](https://playwright.dev/). Cubre los 11 módulos del portal, navegación, RBAC y responsividad móvil en dos modos: **local** (sin backend) y **dev** (contra la API real).

---

## Requisitos

- Node.js 18+
- `npm install` ejecutado en la raíz del proyecto
- Chromium instalado por Playwright (`npx playwright install chromium`)

---

## Comandos

```bash
# Ejecutar todos los tests en modo local (recomendado para desarrollo)
npm run e2e

# Abrir la UI interactiva de Playwright (modo local)
npm run e2e:ui

# Ejecutar contra el ambiente de dev (requiere configurar .env.e2e.dev)
npm run e2e:dev

# UI interactiva contra dev
npm run e2e:dev:ui

# Ver reporte HTML del último run
npm run e2e:report        # local
npm run e2e:report:dev    # dev
```

### Ejecutar un spec o test específico

```bash
# Un archivo entero
npx cross-env E2E_ENV=local playwright test 04-appointments

# Un test por nombre
npx cross-env E2E_ENV=local playwright test --grep "muestra el título"

# Solo un proyecto (chromium o mobile)
npx cross-env E2E_ENV=local playwright test --project=chromium
```

---

## Modos de ejecución

### LOCAL `E2E_USE_MOCKS=true` (por defecto)

- No requiere backend real.
- La autenticación usa **fake JWTs** inyectados directamente en `localStorage`.
- Las llamadas a la API son **interceptadas** por `page.route()` y devuelven datos ficticios de `helpers/mock-data.ts`.
- El servidor de Angular (`npm run start`) se levanta automáticamente si no está corriendo.

### DEV `E2E_USE_MOCKS=false`

- Apunta a la aplicación y API desplegadas en el ambiente de desarrollo.
- El login se realiza llenando el formulario real con las credenciales configuradas.
- Las llamadas a la API llegan al backend real.
- No levanta servidor local.

---

## Configuración de entornos

Los archivos de entorno se encuentran en la raíz del proyecto:

| Archivo | Propósito | ¿Se commitea? |
|---|---|---|
| `.env.e2e.local` | Configuración local con mocks | Sí (como ejemplo) |
| `.env.e2e.dev` | URLs y credenciales reales de dev | **No** (en `.gitignore`) |

### Variables disponibles

```env
# URL de la aplicación Angular
E2E_BASE_URL=http://localhost:4200

# URL del backend
E2E_API_URL=http://localhost:3000

# true = usar mocks, false = API real
E2E_USE_MOCKS=true

# Credenciales por rol
E2E_ADMIN_EMAIL=admin@medora.com
E2E_ADMIN_PASSWORD=Admin123!

E2E_DOCTOR_EMAIL=doctor@medora.com
E2E_DOCTOR_PASSWORD=Doctor123!

E2E_RECEPTIONIST_EMAIL=recepcionista@medora.com
E2E_RECEPTIONIST_PASSWORD=Recep123!

E2E_AUXILIARY_EMAIL=auxiliar@medora.com
E2E_AUXILIARY_PASSWORD=Aux123!
```

Para apuntar a dev, edita `.env.e2e.dev` con las URLs y credenciales reales y ejecuta `npm run e2e:dev`.

---

## Estructura

```
e2e/
├── helpers/
│   ├── env.ts          # Lee las variables de entorno y las exporta tipadas
│   ├── fake-jwt.ts     # Genera JWTs falsos para los tests de RBAC en modo local
│   ├── mock-data.ts    # Fixtures realistas para todos los endpoints de la API
│   └── setup.ts        # loginAs(), mockAllApis(), setupPage() — helpers principales
├── pages/
│   ├── auth.page.ts    # Page Object para el formulario de login
│   └── layout.page.ts  # Page Object para sidebar y header
├── fixtures/
│   └── auth.fixtures.ts # Constantes de credenciales
├── 01-auth.spec.ts          # Login, validación, restauración de sesión, logout, guards
├── 02-navigation.spec.ts    # Sidebar, RBAC, header, colapso
├── 03-dashboard.spec.ts     # KPIs, tabs de periodo, gráfica, citas de hoy
├── 04-appointments.spec.ts  # Lista, filtros, búsqueda, cambios de estado, crear
├── 05-patients.spec.ts      # Lista, búsqueda, crear, detalle, eliminar
├── 06-calendar.spec.ts      # Vista semana/día, navegación, filtro profesional
├── 07-professionals.spec.ts # Lista, filtro especialidad, búsqueda, crear
├── 08-appointment-types.spec.ts # Stats, tabla, búsqueda, crear
├── 09-billing.spec.ts       # Stats de ingresos, tabla, filtros de estado
├── 10-schedules.spec.ts     # Grilla semanal, filtro por profesional
├── 11-settings.spec.ts      # Formulario clínica, tabla de usuarios
├── 12-prescriptions.spec.ts # Lista, búsqueda, navegación a crear
├── 13-treatment-plans.spec.ts # Lista, filtros, búsqueda, crear
├── 14-mobile.spec.ts        # Drawer móvil, scroll de tablas, layout responsive
└── tsconfig.json            # TypeScript config para los tests
```

---

## Proyectos (browsers)

Los tests corren en **dos proyectos** definidos en `playwright.config.ts`:

| Proyecto | Dispositivo | Propósito |
|---|---|---|
| `chromium` | Desktop Chrome (1280×720) | Tests funcionales completos |
| `mobile` | iPhone 12 (390×844) | Tests de responsividad |

Para correr solo un proyecto:

```bash
npx cross-env E2E_ENV=local playwright test --project=chromium
npx cross-env E2E_ENV=local playwright test --project=mobile
```

---

## Helpers principales

### `setupPage(page, route, role?)`

El helper más usado. Hace todo en una línea: activa mocks (si local), autentica y navega.

```typescript
test.beforeEach(async ({ page }) => {
  await setupPage(page, '/appointments', 'ADMIN');
});
```

### `loginAs(page, role?)`

Solo autentica, sin navegar a ninguna ruta específica.

```typescript
await loginAs(page, 'DOCTOR');
```

### `mockAllApis(page)`

Intercepta todos los endpoints GET con datos ficticios. No hace nada en modo dev.

```typescript
await mockAllApis(page);
```

### `createFakeJwt(payload)`

Genera un JWT válido sintácticamente para que la app lo decodifique. Útil para tests de RBAC sin credenciales reales.

```typescript
import { createFakeJwt } from './helpers/fake-jwt';

const token = createFakeJwt({
  sub: '99', name: 'Test User', email: 'test@medora.com',
  role: 'RECEPTIONIST', tenantId: 'tenant-1',
});
```

---

## Agregar nuevos tests

1. Crea un archivo `XX-nombre.spec.ts` en esta carpeta.
2. Usa `setupPage` en el `beforeEach` para autenticar y navegar.
3. Si el test necesita una respuesta específica de la API, usa `page.route()` para sobreescribir el mock global.

```typescript
import { test, expect } from '@playwright/test';
import { setupPage } from './helpers/setup';
import { API_URL } from './helpers/env';

test.describe('Mi módulo', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page, '/mi-ruta');
  });

  test('muestra el título correcto', async ({ page }) => {
    await expect(page.locator('.page__title')).toHaveText('Mi módulo');
  });

  test('maneja error de API', async ({ page }) => {
    await page.route(`${API_URL}/mi-endpoint`, (r) =>
      r.fulfill({ status: 500, json: { message: 'Error del servidor' } }),
    );
    await page.reload();
    await expect(page.locator('.alert--error')).toBeVisible();
  });
});
```
