# Actualización Integral de PRISMA: Presentación Institucional, Administración General y Perfiles Limpios

Plataforma de inteligencia y refracción curricular PRISMA actualizada con una portada de presentación moderna y explicativa, eliminación de usuarios previos, creación del Administrador General con supervisión de solo lectura y métricas, y arranque de usuarios regulares en blanco con formularios limpios y guías contextuales.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisiones Confirmadas con el Usuario en Fase 1:**
> 1. **Visualización para el Administrador General (`prisma.dig.office@gmail.com`):** Panel de supervisión centralizado con lista de usuarios registrados, auditoría en **modo estricto de solo lectura** (sin botones de edición, eliminación ni alteración de datos personales privados), acompañado de un resumen métrico y estadístico de avance y áreas de especialidad.
> 2. **Pantalla Inicial al Cargar la App:** Pantalla de presentación moderna y elegante que expone el propósito de PRISMA, la metáfora de refracción curricular, los 6 módulos y la política de privacidad, con botones de acción rápida para "Iniciar Sesión" y "Crear Cuenta".
> 3. **Estado Inicial para Nuevos Usuarios:** Tablero y formularios completamente limpios (sin datos preexistentes de terceros como Carlos Mendoza), con casillas en blanco y guías de sugerencia paso a paso.

---

### 1. Overview & Core Concept

* **Propósito y Experiencia de Usuario:** 
  PRISMA deja de forzar directamente el formulario de login. Al ingresar, el visitante descubre una presentación de alto impacto que explica cómo un perfil profesional maestro se refracta en múltiples CVs optimizados para ATS y oportunidades laborales concretas. Desde allí, puede iniciar sesión o registrarse.
* **Separación Estricta de Datos y Privacidad:**
  Los usuarios nuevos inician con su propio espacio de trabajo limpio (`empty state`). Cada usuario solo accede a sus propios datos en su almacenamiento aislado.
* **Supervisión de Administración General (`prisma.dig.office@gmail.com`):**
  Un rol de Administrador General con credenciales exclusivas que cuenta con un panel analítico y visor de perfiles en modo lectura, garantizando la privacidad de los datos personales sensibles de cada candidato.

---

### 2. User Experience & Visual Design

#### Flujo de Navegación y Vistas Clave
1. **Vista de Presentación PRISMA (Vista por Defecto):**
   * *Barra Superior (Top Bar Contract):* Marca "PRISMA" tipográfica, enlaces de navegación temática (`Propósito`, `Metodología`, `Módulos`, `Seguridad`), y botones de acción única: `Iniciar Sesión` y `Crear Cuenta`.
   * *Sección Hero:* Título de alto impacto visual (*"Tu perfil profesional. Un CV para cada oportunidad"*), descripción del principio de refracción curricular y botón primario *"Comenzar Registro"*.
   * *Sección Metodología:* Explicación de cómo 1 Perfil Maestro $\rightarrow$ Refracción Inteligente $\rightarrow$ CVs Adaptados $\rightarrow$ Optimización ATS.
   * *Cuadrícula Asimétrica de Módulos:* Presentación de los 6 pilares de PRISMA (Perfil Maestro, Diseñador de CVs, Validador ATS, Gestor de Postulaciones, Cartas de Presentación y Simulador de Entrevistas).
   * *Garantía de Privacidad:* Indicación explícita sobre el cifrado y protección de datos privados.
   * *Pie de Página Discreto:* Derechos reservados, enlaces informativos y accesos directos.
2. **Modal/Vista de Acceso y Registro:**
   * Al pulsar `Iniciar Sesión` o `Registrarse`, se abre la interfaz de autenticación estilizada con verificación por correo SMTP y código de seguridad.
   * Se elimina la lista anterior de usuarios demo (`carlos.mendoza`, `alianzero`, etc.). Solo existe `prisma.dig.office@gmail.com` como administrador inicial preconfigurado y los nuevos usuarios que se registren.
3. **Experiencia de Usuario Regular (Espacio Limpio):**
   * Al registrarse o acceder, el usuario ve su propio nombre y un formulario limpio con tarjetas vacías estructuradas, badges de progreso inicial (`0% completado`) y botones de acción guiada (`"Agregar Primera Experiencia"`, `"Cargar Título o Grado"`, `"Crear CV Inicial"`).
4. **Experiencia de Administración General (`prisma.dig.office@gmail.com`):**
   * Pestaña exclusiva de **Supervisión General**.
   * Métricas globales: Total de usuarios registrados, porcentaje promedio de llenado, distribución por áreas técnicas y tasa de validación.
   * Tabla de usuarios registrados con buscador, filtros y botón *"Auditar en Solo Lectura"*. Al auditar, el administrador visualiza el perfil en modo visualización protegida sin campos editables ni botones destructivos.

#### Sistema Visual y Tipografía
* **Paleta:** Base neutra limpia (`#F8FAFC` / `#FFFFFF`), superficies estructurales con bordes de 1px (`border-slate-200`), y acento azul marino institucional (`#0F172A`, `#1E40AF`, `#0284C7`) con toques esmeralda para verificación.
* **Tipografía:** *Plus Jakarta Sans* para títulos y botones; *DM Sans* para textos explicativos; números tabulares (`font-mono tabular-nums`) para métricas de supervisión.
* **Cero Clichés de IA:** Sin degradados púrpuras chillones, sin tarjetas anidadas excesivas, sin píldoras decorativas en títulos.

---

### 3. Key Product Decisions & Trade-Offs

* **Decisión 1: Purga Completa de Cuentas Anteriores y Creación de Superadmin**
  * *Enfoque:* Eliminar del servidor `app.ts` y de `/api/auth/users-list.ts` los usuarios antiguos (`carlos.mendoza`, `alianzero391`, `mangeltorresd99`, `scjasjc`, `admin`). Establecer como único usuario maestro a `prisma.dig.office@gmail.com` con rol `admin_general`.
  * *Por qué:* Cumple con la instrucción directa del usuario de limpiar la base de datos previa e inicializar el entorno administrativo corporativo.
* **Decisión 2: Almacenamiento Aislado por Usuario (`User-Scoped Storage`)**
  * *Enfoque:* Las claves de almacenamiento local se asociarán al identificador del usuario autenticado (ejemplo: `prisma_profile_${userId}`, `prisma_cvs_${userId}`).
  * *Por qué:* Evita que un nuevo usuario vea datos de otros usuarios o que el contenido de ejemplo de sesiones anteriores contamine una cuenta nueva.
* **Decisión 3: Modo Solo Lectura para Administración (Protección de Datos Privados)**
  * *Enfoque:* Cuando el usuario logueado sea `prisma.dig.office@gmail.com`, podrá inspeccionar los módulos de los usuarios registrados, pero todas las funciones de mutación (`onUpdateProfile`, `handleSaveCv`, `handleDeleteDocument`, etc.) se desactivan o se muestran en modo ficha informativa.
  * *Por qué:* Garantiza la estricta confidencialidad y privacidad solicitada por el usuario.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRISMA WEB APPLICATION                          │
└────────────────────────────────────────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌────────────────────────┐                        ┌──────────────────────┐
│  Presentation Portal   │                        │  Auth Modal / Screen │
│  (Landing Institucional)│                        │  (Login / Registro)  │
│  - Propósito & Visión  │                        │  - prisma.dig.office │
│  - Módulos Explicados  │                        │  - Nuevos Usuarios   │
│  - CTA Login / Sign Up │                        └──────────────────────┘
└────────────────────────┘                                   │
                                                             ▼
                                                  ┌──────────────────────┐
                                                  │ Router por Rol/Sesión│
                                                  └──────────────────────┘
                                    ┌────────────────────────┴────────────────────────┐
                                    ▼                                                 ▼
                    ┌───────────────────────────────┐                 ┌───────────────────────────────┐
                    │    Usuario Regular Privado    │                 │    Administrador General      │
                    │   (Espacio Limpio / Guiado)   │                 │ (prisma.dig.office@gmail.com) │
                    ├───────────────────────────────┤                 ├───────────────────────────────┤
                    │ • Perfil Maestro en Blanco    │                 │ • Panel Estadístico & Métricas│
                    │ • Generador de CVs Personal   │                 │ • Directorio de Registrados   │
                    │ • Estado Cero con Consejos    │                 │ • Visor Solo Lectura Auditado │
                    │ • Storage Aislado (UID)       │                 │ • Sin permisos de edición     │
                    └───────────────────────────────┘                 └───────────────────────────────┘
                                    │                                                 │
                                    └────────────────────────┬────────────────────────┘
                                                             ▼
                                              ┌───────────────────────────────┐
                                              │      Express & Serverless     │
                                              │    /api/auth/users-list       │
                                              │    /api/auth/verify-code      │
                                              │    /api/auth/send-verification│
                                              └───────────────────────────────┘
```

#### Plan de Modificaciones de Archivos
1. **Servidor y API (`app.ts` y `/api/auth/users-list.ts`, `api/auth/login.ts`):**
   * Eliminar la lista anterior de usuarios en `usersStore`.
   * Registrar a `prisma.dig.office@gmail.com` como administrador general con rol `admin_general` y contraseña segura.
   * Mantener los endpoints de registro y login plenamente funcionales.
2. **Plantilla Limpia (`src/data/initialData.ts`):**
   * Crear constante `EMPTY_PROFILE`, `EMPTY_CV_VERSIONS`, `EMPTY_APPLICATIONS`, `EMPTY_DOCUMENTS` para cuentas nuevas.
   * Mantener guías de ayuda y placeholders pedagógicos sin datos personales ajenos.
3. **Componente de Presentación (`src/components/Presentation/PresentationView.tsx`):**
   * Desarrollar la pantalla de presentación corporativa de PRISMA con arquitectura visual moderna, tarjetas explicativas de módulos, sección de propósito y botones para iniciar sesión y registrarse.
4. **Panel de Administración General (`src/components/Admin/AdminSupervisorDashboard.tsx`):**
   * Interfaz de métricas consolidadas, lista de usuarios registrados, fecha de creación, área técnica y visualizador en solo lectura.
5. **Orquestación en `src/App.tsx` y `src/components/Navbar.tsx`:**
   * Mostrar por defecto la vista de presentación si no hay usuario autenticado (con modal o toggle directo para login/registro).
   * Proveer almacenamiento aislado por usuario.
   * Habilitar pestañas de usuario regular y pestaña de supervisión para el administrador general.
