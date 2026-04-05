@AGENTS.md

## Contexto del proyecto
- App de nutrición infantil para **André** en Next.js 16 + React 19
- SPA con navegación por tabs (7 tabs: Inicio, Plan, Listado, Asesoría, Registro, Salud, Opciones)
- Datos persistidos en localStorage con prefijo `na-`
- Deploy en Vercel: https://github.com/chris075-droid/Nutri-andre
- Push a `master` = deploy automático

## André
- Persona para quien se diseña la app (recordar nombre en contexto)
- Edad calculada dinámicamente desde `profile.birthDate` via `calcAge()`
- Etapas: newborn, infant, solids, toddler, preschool
- Caché de recetas expira cada 6 meses para adaptarse a nueva etapa
- Auto-limpieza al cambiar de semestre de edad (12, 18, 24, 30... meses)

## Arquitectura de datos (localStorage)
- `na-profile` — perfil (name, birthDate, sex, allergies, notes)
- `na-meals` — registro de comidas (permanente, nunca expira)
- `na-health` — registros de crecimiento WHO
- `na-plan-recipes` — caché unificado de recetas (expira 6 meses)
- `na-plan-recipes-meta` — metadata de expiración del caché
- `na-plan-week-{fecha}` / `na-plan-day-{fecha}` — planes generados
- `na-confirm-week` / `na-confirm-day` — timestamps de confirmación
- `na-shopping-week` / `na-shopping-day` — listas de compras
- `na-custom-nutri/suggestion/snack/dessert/tip` — secciones actualizadas con IA
- `na-age-semester` — semestre actual para detectar cambios
- `na-savings` / `na-sonnet` — configuración

## Módulos de Inicio
- Recomendaciones nutricionales (por grupo de edad, datos AAP/OMS/DGA)
- Sugerencia del día (POOL: 50 comidas)
- Snack del día (SNACK_POOL: 42 snacks)
- Postre saludable del día (DESSERT_POOL: 34 postres)
- Consejo del día (TIPS_POOL: 63 consejos de expertos)
- Cada módulo: botón ver receta + botón actualizar con IA

## Plan (PlanTab.jsx)
- Sub-pestañas: Plan Semanal y Plan Diario
- Genera con IA (Haiku híbrido o Sonnet completo)
- Cada comida expandible: Preparación (caché) + Rebarajear (IA)
- Botón Confirmado: descarga en background, genera lista de compras
- Bloqueo temporal: semanal=7 días, diario=1 día
- Reactivar desde Opciones

## Listado (ListadoTab.jsx)
- Sub-pestañas: Semanal y Diario
- Lista de compras con ingredientes consolidados (sumQuantities)
- Casillas tachables con barra de progreso

## Registro
- Categorías por tipo de comida (Desayuno, Comida, Merienda, Cena) según etapa
- Buscador de alimentos del caché de recetas con autocomplete
- Info nutricional al seleccionar platillo
- "Sus gustos" — historial filtrable por apetito (Le encantó, Comió bien, etc.)
- Recetas expandibles desde caché, botón actualizar si expiró

## IA y tokens
- Haiku para búsquedas de datos (económico)
- Sonnet solo cuando el usuario lo activa explícitamente
- Confirmación antes de reemplazar receta con Sonnet
- Cada botón es independiente (no afecta otros módulos)
- `safeParseJSON()` en PlanTab para JSON truncado
- `buildRecipe(suggestion, ageLabel, useSonnet, forceRefresh)` con caché unificado

## APIs
- Anthropic Claude via `/api/ai` (proxy backend)
- TheMealDB (gratis, sin key) — recetas base
- Open Food Facts (gratis, sin key) — nutrición real
- Fintual API — NAV de PPR (no aplica aquí)

## Respaldo
- Exportar: Web Share API (celular) + descarga directa (PC)
- Importar: selector de archivo + botón abrir Google Drive
- Archivo: `nutriandre-backup-{fecha}.json`

## Convenciones
- Commits en español con Co-Authored-By Claude
- Branch: master
- Componentes en /components, utilidades en /lib
- Estilos inline con constantes C (colores) y grad (gradiente)
- Font: Nunito
