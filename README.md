#  TechStore - E-Commerce MERN Platform

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=white)

TechStore es una plataforma de comercio electrónico integral y escalable, desarrollada desde cero utilizando la pila tecnológica **MERN**. Diseñada con un enfoque "Mobile-First" y arquitectura orientada a servicios, la aplicación ofrece una experiencia de usuario optimizada, pasarela de pagos integrada y un ecosistema de gestión administrativa completo.

---

##  Propuesta de Valor y Características

###  Experiencia del Cliente (B2C)
* **Catálogo Inteligente:** Filtrado multi-criterio, buscador predictivo y paginación optimizada.
* **Carrito de Compras:** Gestión de estado global, persistencia de datos y validador de cupones de descuento en tiempo real.
* **Checkout Seguro:** Integración oficial de **Transbank Webpay Plus (REST API)** para transacciones financieras fiables.
* **Sistema de Notificaciones:** 
    * **Email:** Envío automatizado para confirmación de pedidos, validación de registro y recuperación de contraseñas.
    * **In-App:** Centro de notificaciones para estados de pedidos y alertas de sistema.
* **Portal de Usuario:** Gestión de perfil, direcciones, lista de deseos (Wishlist) y trazabilidad completa de pedidos mediante un *timeline* logístico.

###  Panel de Administración (B2B)
* **Dashboard Analítico:** Visualización de KPIs, ventas mensuales y métricas de crecimiento mediante gráficos interactivos.
* **Gestión de Inventario (CRUD):** Administración total de productos con soporte para subida de imágenes (Middleware Multer) y control de stock en tiempo real.
* **Logística y Procesos:** Interfaz avanzada para la actualización de estados de órdenes de compra.
* **Gestión de Usuarios:** Control de roles, permisos y administración de perfiles de clientes.
* **Motor de Marketing:** Creación y gestión de cupones promocionales con lógica de validación.

---

##  Funciones de Ingeniería y Seguridad
* **Seguridad de Nivel Empresarial:** Implementación de JWT (JSON Web Tokens) para sesiones sin estado y encriptación de contraseñas con Bcrypt.js.
* **Rutas Protegidas:** Sistema de *PrivateRoutes* con verificación de permisos basada en roles (Admin/User).
* **UI/UX Adaptativa:** Implementación de Skeleton Loaders, estados de error, estados vacíos y feedback visual (Toasts).
* **Validación de Datos:** Sanitización de inputs y validación de esquemas para evitar inyecciones.
* **Patrón de Diseño:** Implementación de arquitectura MVC (Model-View-Controller) para una escalabilidad óptima.

---

##  Interfaz de Usuario y Flujos

### 1. Inicio y Catálogo de Productos
| Landing Page | Categorías Dinámicas |
| :---: | :---: |
| <img src="docs/index.PNG" width="400" /> | <img src="docs/index2.PNG" width="400" /> |
| **Grid de Catálogo** | **Filtros Avanzados** |
| <img src="docs/catalogo1.PNG" width="400" /> | <img src="docs/catalogo2.PNG" width="400" /> |
| **Vista de Producto (Top)** | **Detalle de Producto (Bottom)** |
| <img src="docs/detalle producto.PNG" width="400" /> | <img src="docs/detalle producto 2.PNG" width="400" /> |

### 2. E-Commerce: Carrito y Webpay
| Carrito Lateral (Drawer) | Vista de Carrito Completa |
| :---: | :---: |
| <img src="docs/carrito de compras.PNG" width="400" /> | <img src="docs/mi carrito de compras.PNG" width="400" /> |
| **Resumen y Checkout** | **Pasarela de Pago (Webpay)** |
| <img src="docs/resumen.PNG" width="400" /> | <img src="docs/integracion webpay.PNG" width="400" /> |

### 3. Portal de Usuario y Seguridad
| Login y Autenticación | Registro de Cuenta |
| :---: | :---: |
| <img src="docs/login1.PNG" width="400" /> | <img src="docs/register.PNG" width="400" /> |
| **Dashboard de Usuario** | **Ajustes de Perfil** |
| <img src="docs/usuario 1.PNG" width="400" /> | <img src="docs/config perfil.PNG" width="400" /> |
| **Historial de Pedidos** | **Tracking Logístico** |
| <img src="docs/mis pedidos usuario.PNG" width="400" /> | <img src="docs/detalle mis pedidos.PNG" width="400" /> |
| **Lista de Deseos (Wishlist)** | **Centro de Notificaciones** |
| <img src="docs/mis favoritos.PNG" width="400" /> | <img src="docs/notificaciones usuario.PNG" width="400" /> |

### 4. Back-Office: Panel de Administración
| Dashboard Principal | Analítica Mensual |
| :---: | :---: |
| <img src="docs/dashboard admin 1.PNG" width="400" /> | <img src="docs/ventas mensual.PNG" width="400" /> |
| **Inventario de Productos** | **Formulario de Carga (Multer)** |
| <img src="docs/productos admin 1.PNG" width="400" /> | <img src="docs/agregar producto admin.PNG" width="400" /> |
| **Gestión de Órdenes** | **Administración de Clientes** |
| <img src="docs/pedidos admin.PNG" width="400" /> | <img src="docs/usuarios admin 1.PNG" width="400" /> |
| **Monitor de Cupones** | **Generador de Descuentos** |
| <img src="docs/cupones 1.PNG" width="400" /> | <img src="docs/crear cupon.PNG" width="400" /> |

---

##  Instalación y Despliegue Local

### 1. Requisitos previos
* [Node.js](https://nodejs.org/) (v16+)
* [MongoDB](https://www.mongodb.com/) (Local o Atlas)

### 2. Clonar el repositorio
```bash
git clone [https://github.com/IgnacioRuizMcode/techstore.git](https://github.com/IgnacioRuizMcode/techstore.git)
cd techstore 

### 3. Configuración de Variables de Entorno
Crea un archivo .env dentro de la carpeta server/ con:
