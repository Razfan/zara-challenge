# Tienda de móviles

Aplicación web para consultar un catálogo de teléfonos móviles, buscar por marca o modelo, ver el detalle de cada producto y gestionar un carrito persistente.

**Demo:** _pendiente de desplegar_

## Cómo ejecutar

Requisitos: Node.js ≥ 18.18 y npm.

```bash
npm install
cp .env.example .env.local   # y rellenar API_KEY
npm run dev                  # http://localhost:3000
```

La clave de la API (`x-api-key`) solo se usa en el servidor y nunca llega al navegador.

| Comando                      | Qué hace                                     |
| ---------------------------- | -------------------------------------------- |
| `npm run dev`                | Desarrollo (assets sin minimizar)            |
| `npm run build && npm start` | Build y servidor de producción (minimizados) |
| `npm test`                   | Tests unitarios y de componentes             |
| `npm run typecheck`          | Comprobación de tipos                        |
| `npm run lint`               | ESLint                                       |
| `npm run format:check`       | Prettier                                     |

## Estructura del proyecto

```
src/
  app/            # Rutas (Next.js App Router): listado, detalle, carrito, loading/error/not-found
  components/
    layout/       # Navbar, logo, icono y contador del carrito
    product/      # Tarjeta, grid, buscador, contador de resultados
    detail/       # Selectores de color/almacenamiento, precio e imagen animados, specs, similares
    cart/         # Línea de carrito y resumen
  context/        # CartContext (useReducer + persistencia en localStorage)
  hooks/          # useDebounce, useFlip, useExitAnimation, usePreviousValue...
  lib/            # api.ts (fetch server-only), products.ts (mapeo de la API), types.ts, utils.ts
  styles/         # tokens.scss (variables CSS), mixins de breakpoints, estilos globales
```

Cada componente con lógica lleva su test al lado (`X.test.tsx`).

## Decisiones técnicas

- **Next.js App Router con SSR.** El listado y el detalle se renderizan en el servidor: la clave de la API nunca sale de ahí y el despliegue es nativo en Vercel.
- **Clave de API solo en servidor.** `lib/api.ts` importa `server-only`: si algún Client Component llegara a importarlo, el build falla. La variable de entorno no lleva prefijo `NEXT_PUBLIC_`, así que en el navegador ni siquiera existiría.
- **Búsqueda en la URL, filtrada por la API.** `?search=` se envía tal cual a la API (no se filtra en el cliente), así que el resultado es compartible, funciona sin JavaScript y se renderiza en el servidor.
- **Carrito con Context + `useReducer`.** Es el único estado que de verdad se comparte entre pantallas (navbar, detalle, carrito). Se persiste en `localStorage`, pero la carga ocurre en un `useEffect` tras montar para no romper la hidratación (servidor y primer render de cliente no tienen acceso a `localStorage`).
- **SCSS Modules con variables CSS.** Funcionan en Server Components sin coste de runtime (a diferencia de librerías CSS-in-JS, que exigirían marcar más componentes como cliente). Los tokens de Figma (colores, tipografía, espaciados, duraciones) viven como custom properties en `styles/tokens.scss`.

## Testing y calidad

- Jest + Testing Library para lógica y componentes; `jest-axe` en los componentes principales para accesibilidad automatizada.
- ESLint (config de Next + `jsx-a11y`) y Prettier.
- Consola del navegador limpia en desarrollo y producción.

## Despliegue

Desplegado en Vercel. Variables de entorno necesarias en el proyecto: `API_KEY`.

## Mejoras futuras

- Checkout real tras "PAY": resumen, formulario de pago y vaciado del carrito.
- Selector de cantidad en el carrito, agrupando líneas idénticas.
- Sincronizar el carrito entre pestañas con el evento `storage`.
- Tests end-to-end (Playwright) sobre el flujo completo de compra.
- Integración continua (GitHub Actions) con typecheck, lint, test y build en cada push.
