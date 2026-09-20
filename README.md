# Prueba Técnica - Disagro
## Evento de Promociones Anuales (Confirmación de Asistencia)

```js
Programador: Elder Anibal Pum Rojas
Correo: ElderPum@gmail.com
```
---

# Explicación del Proyecto
Es un proyecto que consta de 2 partes: un backend y un frontend, completamente dockerizado para facilitar el despliegue y desarrollo.

El backend está desarrollado con TypeScript y corre Node 20. Es una API REST que se conecta a una base de datos SQL Server y utiliza consultas SQL parametrizadas para la manipulación de datos. La API funciona como intermediario entre el frontend y la base de datos, proporcionando endpoints RESTful para la gestión del catálogo (servicios/productos), confirmaciones de asistencia, usuarios administrativos y el cálculo de descuentos según las reglas de negocio del evento.

El frontend está desarrollado con React, TypeScript y Vite, utilizando Bootstrap y Font Awesome para los estilos, así como un sistema de diseño CSS personalizado con variables CSS para mantener consistencia en toda la aplicación. Incluye un formulario público para que los clientes confirmen su asistencia y un panel administrativo protegido con JWT.

El proyecto utiliza Docker Compose para orquestar los servicios (base de datos SQL Server, backend y frontend), permitiendo un despliegue rápido y consistente en cualquier entorno.

## Arquitectura del Proyecto

La arquitectura del proyecto sigue un patrón de tres capas (3-tier architecture) con separación clara de responsabilidades:

### Capa de Presentación (Frontend)
- **Tecnología**: React 19 con TypeScript y Vite
- **Responsabilidades**:
  - Formulario público de confirmación de asistencia
  - Interfaz administrativa (catálogo, confirmaciones, usuarios)
  - Gestión de estado del cliente
  - Enrutamiento y navegación protegida (admin)
  - Preview en vivo de descuentos
- **Comunicación**: Se comunica exclusivamente con el backend mediante peticiones HTTP/REST
- **Autenticación**: Maneja tokens JWT almacenados en localStorage para mantener sesiones administrativas

### Capa de Aplicación (Backend/API)
- **Tecnología**: Node.js 20 con Express y TypeScript
- **Responsabilidades**:
  - Procesamiento de lógica de negocio (incluyendo cálculo de descuentos)
  - Validación de datos de entrada
  - Autenticación y autorización mediante JWT
  - Snapshots de precios/tipo/nombre al confirmar asistencia
  - Transformación de datos entre frontend y base de datos
- **Arquitectura MVC**:
  - **Rutas (Routes)**: Definen los endpoints y middlewares de autenticación
  - **Controladores (Controllers)**: Contienen la lógica de negocio y manejan requests/responses
  - **Modelos (Models)**: Interactúan con la base de datos mediante consultas SQL parametrizadas
- **Comunicación**:
  - Recibe peticiones del frontend
  - Ejecuta consultas parametrizadas en SQL Server
  - Devuelve respuestas JSON estructuradas

### Capa de Datos (Base de Datos)
- **Tecnología**: Microsoft SQL Server 2019
- **Responsabilidades**:
  - Almacenamiento persistente de datos
  - Integridad referencial mediante foreign keys y constraints
  - Persistencia de confirmaciones históricas con precios congelados (snapshot)
- **Acceso a datos**:
  - Consultas SQL parametrizadas desde los modelos del backend
  - Validaciones a nivel de base de datos (CHECK, UNIQUE, FK)

### Flujo de Datos
1. **Formulario público**: El cliente carga el catálogo activo, selecciona ítems y ve el preview de descuentos
2. **Confirmación**: Al enviar el formulario, el backend calcula descuentos, guarda la cabecera y el detalle con snapshot
3. **Autenticación admin**: El usuario inicia sesión, el backend valida credenciales contra la BD y devuelve un token JWT
4. **Peticiones autenticadas**: Cada petición administrativa incluye el token JWT en el header Authorization
5. **Middleware de autenticación**: El backend valida el token antes de procesar rutas protegidas
6. **Procesamiento**: El controlador ejecuta la lógica de negocio y llama al modelo correspondiente
7. **Respuesta**: Los datos se transforman y se devuelven al frontend en formato JSON

### Orquestación con Docker
- **Docker Compose**: Orquesta tres servicios independientes:
  - **disagro-database**: Contenedor de SQL Server con persistencia de datos
  - **disagro-backend**: Contenedor del API REST con Node.js
  - **disagro-frontend**: Contenedor con Nginx sirviendo la aplicación React compilada
- **Comunicación**: Los servicios se comunican mediante la red interna de Docker
- **Persistencia**: Los datos de la base de datos se almacenan en el volumen Docker `disagro_sqlserver_data`

# Modelo Entidad-Relación

```text
┌──────────────────────┐         ┌──────────────────────────┐
│        Users         │         │           Item           │
│  (Admin / sesión)    │         │   (Servicio / Producto)  │
├──────────────────────┤         ├──────────────────────────┤
│ id (PK)              │         │ id (PK)                  │
│ name                 │         │ name                     │
│ email (UNIQUE)       │         │ description              │
│ password (bcrypt)    │         │ type (SERVICE/PRODUCT)   │
│ role                 │         │ price (Q)                │
│ active               │         │ active                   │
│ createdAt            │         │ createdAt                │
└──────────────────────┘         └────────────▲─────────────┘
                                              │
                                              │ N
┌──────────────────────┐         ┌────────────┴─────────────┐
│     Confirmation     │ 1     N │     ConfirmationItem     │
│ (Registro asistencia)│─────────│   (Detalle elegido)      │
├──────────────────────┤         ├──────────────────────────┤
│ id (PK)              │         │ confirmationId (FK, PK)  │
│ clientName           │         │ itemId (FK, PK)          │
│ clientLastname       │         │ unitPrice (snapshot)     │
│ clientEmail          │         │ itemType (snapshot)      │
│ eventDateTime        │         │ itemName (snapshot)      │
│ servicesDiscount %   │         └──────────────────────────┘
│ productsDiscount %   │
│ totalAmount          │
│ finalAmount          │
│ createdAt            │
└──────────────────────┘
```

El modelo está diseñado para el evento de promociones: un catálogo unificado de ítems, confirmaciones de clientes y un detalle N:M con snapshot para no perder el historial si cambian precios o nombres del catálogo.

## Entidades Principales

### Users
Representa a los usuarios administrativos del sistema (sesión JWT).

**Atributos**:
- `id` (INT, PK): Identificador único autoincremental
- `name` (NVARCHAR(150), NOT NULL): Nombre del usuario
- `email` (NVARCHAR(150), NOT NULL, UNIQUE): Correo para autenticación
- `password` (NVARCHAR(255), NOT NULL): Contraseña hasheada con bcrypt
- `role` (NVARCHAR(50)): Rol del usuario (Admin, Operador)
- `active` (BIT): Estado activo/inactivo
- `createdAt` (DATETIME): Fecha de creación

### Item
Catálogo unificado de servicios y productos ofrecidos en el evento.

**Atributos**:
- `id` (INT, PK): Identificador único autoincremental
- `name` (NVARCHAR(150), NOT NULL): Nombre del ítem
- `description` (NVARCHAR(MAX)): Descripción comercial
- `type` (NVARCHAR(20), NOT NULL): `SERVICE` o `PRODUCT`
- `price` (DECIMAL(10,2), NOT NULL): Precio base en Quetzales
- `active` (BIT): Estado activo/inactivo (soft delete)
- `createdAt` (DATETIME): Fecha de creación

**Relaciones**:
- Puede aparecer en muchas confirmaciones a través de `ConfirmationItem` (N:M)

### Confirmation
Registro de asistencia de un cliente al evento, con el resumen del cálculo de descuentos.

**Atributos**:
- `id` (INT, PK): Identificador único autoincremental
- `clientName` (NVARCHAR(100), NOT NULL): Nombres del cliente
- `clientLastname` (NVARCHAR(100), NOT NULL): Apellidos del cliente
- `clientEmail` (NVARCHAR(150), NOT NULL): Correo del cliente
- `eventDateTime` (DATETIME, NOT NULL): Fecha y hora seleccionada para asistir
- `servicesDiscountPercentage` (DECIMAL(5,2)): Descuento aplicado a servicios (0, 3 o 5)
- `productsDiscountPercentage` (DECIMAL(5,2)): Descuento aplicado a productos (0, 3 o 5)
- `totalAmount` (DECIMAL(10,2)): Subtotal antes de descuentos
- `finalAmount` (DECIMAL(10,2)): Total final después de descuentos
- `createdAt` (DATETIME): Fecha de registro de la confirmación

**Relaciones**:
- Tiene muchos ítems en `ConfirmationItem` (1:N)

### ConfirmationItem
Detalle de los servicios/productos elegidos en una confirmación, con snapshot.

**Atributos**:
- `confirmationId` (INT, FK, PK): Referencia a Confirmation
- `itemId` (INT, FK, PK): Referencia a Item
- `unitPrice` (DECIMAL(10,2)): Precio del ítem al momento de confirmar
- `itemType` (NVARCHAR(20)): Tipo congelado (`SERVICE` / `PRODUCT`)
- `itemName` (NVARCHAR(150)): Nombre congelado del ítem

**Relaciones**:
- Pertenece a una Confirmation (N:1)
- Referencia un Item del catálogo (N:1)

## Reglas de Negocio Implementadas

1. **Descuentos por Servicios**:
   - Si el cliente elige 2 o más servicios → 3%
   - Si elige 2 o más servicios y la suma de precios es mayor a Q.1,500 → 5%

2. **Descuentos por Productos**:
   - Si el cliente elige 3 o más productos → 3%
   - Si elige 5 o más productos → 5%

3. **Cálculo independiente**: Los descuentos de servicios y productos se aplican por separado sobre su respectivo subtotal.

4. **Snapshots de precio**: Al confirmar, se guarda `unitPrice`, `itemType` e `itemName` para que el historial no dependa de cambios futuros del catálogo.

5. **Eliminación lógica**: `Item` y `Users` usan el campo `active` (soft delete) en lugar de borrado físico.

6. **Sesión administrativa**: El panel admin requiere JWT. El formulario público de confirmación no requiere autenticación.

## Comandos para levantar el proyecto con Docker

Para levantar el proyecto completo con Docker Compose, ejecuta los siguientes comandos en orden:

1. **Levantar los servicios** (base de datos, backend y frontend):
```sh
docker compose up -d --build
```

2. **Crear la base de datos, tablas y datos iniciales** (solo la primera vez o si recreaste el volumen):
```sh
docker exec disagro-database /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "DisagroPassword123!" -C -i /scripts/db.sql
```

3. **Verificar que las tablas existen** (opcional):
```sh
docker exec disagro-database /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "DisagroPassword123!" -C -d DisagroEvento -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'"
```

Una vez ejecutados estos comandos, el proyecto estará completamente funcional:
- **Base de datos**: Disponible en el puerto `1433`
- **Backend API**: Disponible en `http://localhost:5000`
- **Frontend**: Disponible en `http://localhost:3000` (o el puerto configurado en `FRONTEND_PORT`)

### Persistencia de datos
Los datos de SQL Server viven en el volumen Docker `disagro_sqlserver_data`. Se conservan al hacer `docker compose down` / `up`. Solo se eliminan con `docker compose down -v`.

### Credenciales de prueba
```text
Admin:   admin@disagro.com / password
SQL sa:  DisagroPassword123!
```

# Procedimientos utilizados en la parte de la API
Se requiere la versión de [Node.Js](https://nodejs.org/en/) más reciente para evitar cualquier tipo de problemas a la hora de correr la API Rest.

Después de instalar o actualizar la versión de NodeJS en su SO, se necesita instalar las librerías necesarias para que funcione, para ello vamos a localizar el siguiente archivo dentro de la carpeta correspondiente al servidor de Node:
```sh
package.json
```
Una vez ubicado, vamos a abrir una terminal y vamos a instalar dicho archivo con el comando:
```sh
npm install
```
Después de haber instalado las librerías y dependencias necesarias, lo que sigue es correr la API Rest con el siguiente comando:
```sh
npm run dev
```

De esta forma el servidor se pondrá a escuchar en el puerto 5000 por defecto, haciendo posible poder escuchar cualquier petición que el frontend mande.

> Para desarrollo local (fuera de Docker), en `backend/.env` usa `DB_SERVER=localhost` apuntando al contenedor de SQL Server.

El servidor tiene una filosofía de trabajo MVC (Modelo-Vista-Controlador) donde las rutas referencian al controlador y estas son las que se comunican con el frontend, el modelo que nos ayuda a conectar con la base de datos SQL Server mediante consultas parametrizadas, y el controlador contiene toda la parte de la lógica que hace funcionar el proyecto. El proyecto se divide en múltiples módulos: auth, items, confirmations y users.

### Módulo de Autenticación (Auth)
El módulo de autenticación permite a los administradores iniciar sesión utilizando sus credenciales. Las contraseñas se almacenan hasheadas con bcrypt.

| Método | Tipo de Petición | Endpoint | Descripción |
| -- | -- | -- | -- |
| Login | POST | `/api/auth/login` | Autentica un usuario con email y contraseña, devuelve un token JWT |
| Verificar Token | GET | `/api/auth/verify` | Verifica la validez del token JWT del usuario autenticado |

### Módulo de Items (Catálogo)
Catálogo unificado de servicios (`SERVICE`) y productos (`PRODUCT`).

| Método | Tipo de Petición | Endpoint | Descripción |
| -- | -- | -- | -- |
| Obtener Items | GET | `/api/items` | Obtiene el catálogo. Público. Usar `?incluirInactivos=true` para ver también inactivos |
| Obtener Item por ID | GET | `/api/items/:id` | Obtiene un ítem específico (público) |
| Crear Item | POST | `/api/items` | Crea un nuevo ítem (requiere JWT) |
| Actualizar Item | PUT | `/api/items/:id` | Actualiza un ítem existente (requiere JWT) |
| Eliminar Item | DELETE | `/api/items/:id` | Soft delete: marca `active = 0` (requiere JWT) |

### Módulo de Confirmaciones
Gestión de confirmaciones de asistencia y cálculo de descuentos.

| Método | Tipo de Petición | Endpoint | Descripción |
| -- | -- | -- | -- |
| Preview descuentos | POST | `/api/confirmations/preview` | Calcula descuentos sin guardar. Body: `{ "itemIds": [1,2,3] }` (público) |
| Crear Confirmación | POST | `/api/confirmations` | Registra asistencia + detalle con snapshot (público) |
| Obtener Confirmaciones | GET | `/api/confirmations` | Lista todas las confirmaciones (requiere JWT) |
| Obtener Confirmación por ID | GET | `/api/confirmations/:id` | Detalle con ítems (requiere JWT) |
| Eliminar Confirmación | DELETE | `/api/confirmations/:id` | Elimina cabecera y detalle (requiere JWT) |

**Body ejemplo para crear confirmación:**
```json
{
  "clientName": "Carlos",
  "clientLastname": "Pérez",
  "clientEmail": "carlos.perez@test.com",
  "eventDateTime": "2026-10-15T10:00:00",
  "itemIds": [1, 2, 6, 7, 8]
}
```

### Módulo de Usuarios
Administración de cuentas para acceso al panel (JWT).

| Método | Tipo de Petición | Endpoint | Descripción |
| -- | -- | -- | -- |
| Obtener Usuarios | GET | `/api/users` | Lista usuarios (requiere JWT) |
| Obtener Usuario por ID | GET | `/api/users/:id` | Obtiene un usuario (requiere JWT) |
| Crear Usuario | POST | `/api/users` | Crea usuario; hashea la contraseña con bcrypt (requiere JWT) |
| Actualizar Usuario | PUT | `/api/users/:id` | Actualiza usuario; si password viene vacío no se cambia (requiere JWT) |
| Eliminar Usuario | DELETE | `/api/users/:id` | Soft delete: marca `active = 0` (requiere JWT) |

# Procedimientos utilizados en la parte del Frontend
El frontend está desarrollado con React 19, TypeScript y Vite como bundler. Se utilizan las siguientes tecnologías y librerías:

- **React Router DOM**: Para la navegación entre páginas y rutas protegidas
- **Bootstrap 5**: Para el sistema de diseño y componentes UI
- **Font Awesome 6**: Para los iconos
- **CSS Variables**: Sistema de diseño personalizado con variables CSS para mantener consistencia

## Estructura del Frontend

El proyecto sigue una arquitectura basada en componentes reutilizables:

- **Componentes**: Vistas públicas y administrativas (ConfirmationForm, Login, Listados, Formularios)
- **Hooks personalizados**: `useAuth`, `useLogin`, `useDataTable`, `useNavigation` para manejar lógica reutilizable
- **Servicios**: Capa de servicios para comunicarse con la API (`api.ts`, `itemsService.ts`, `confirmationsService.ts`, `usersService.ts`)
- **Tipos**: Definiciones TypeScript para tipado fuerte (`types/dataTable.ts`)

## Funcionalidades del Frontend

- **Formulario público de confirmación**: Datos del cliente, selección de servicios/productos, fecha/hora precargada y resumen de descuentos en vivo
- **Autenticación admin**: Login con validación y manejo de tokens JWT
- **Gestión de Catálogo (Items)**: CRUD completo con formularios para crear, editar, ver detalle y desactivar
- **Gestión de Confirmaciones**: Listado, detalle con ítems snapshot y eliminación
- **Gestión de Usuarios**: CRUD para crear más cuentas de prueba/administración
- **DataTable reutilizable**: Búsqueda local, paginación y navegación a detalle

Las rutas administrativas están protegidas con autenticación JWT. El formulario público (`/`) no requiere sesión.

## Rutas principales del Frontend

| Ruta | Acceso | Descripción |
| -- | -- | -- |
| `/` | Público | Formulario de confirmación de asistencia |
| `/login` | Público | Login administrativo |
| `/admin` | JWT | Dashboard |
| `/admin/items` | JWT | Catálogo de servicios/productos |
| `/admin/confirmations` | JWT | Listado de confirmaciones |
| `/admin/users` | JWT | Gestión de usuarios |

## Desarrollo local del Frontend (sin Docker)

```sh
cd frontend
npm install
npm run dev
```

Por defecto Vite sirve en `http://localhost:5173` y consume la API definida en `frontend/.env` (`VITE_API_URL=http://localhost:5000/api`).
