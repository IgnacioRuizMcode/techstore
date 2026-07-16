# ⚡ TechStore - E-Commerce MERN Platform

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=white)

TechStore es una plataforma de comercio electrónico integral y escalable, desarrollada desde cero utilizando la pila tecnológica **MERN**. Diseñada con un enfoque "Mobile-First" y arquitectura orientada a microservicios en el backend, la aplicación ofrece una experiencia de compra fluida, integración real con pasarelas de pago y un panel de administración robusto para la gestión operativa del negocio.

---

## 🚀 Propuesta de Valor y Características

### 🛍️ Experiencia del Cliente (B2C)
* **Catálogo Dinámico:** Filtrado multi-criterio (categorías, marcas, rangos de precio), búsqueda en tiempo real y ordenamiento inteligente.
* **Carrito de Compras Persistente:** Sincronización de estado global mediante Context API, cálculo de subtotales, IVA y motor de validación de cupones de descuento.
* **Checkout Seguro:** Integración oficial de **Transbank Webpay Plus (REST API)** para procesamiento de pagos con tarjetas de crédito y débito.
* **Área Privada de Usuario:** 
  * Historial de transacciones con tracking visual (timeline de despacho).
  * Lista de deseos (Wishlist) y Centro de notificaciones.
  * Gestión de datos personales y direcciones de envío.

### 🏢 Panel de Administración (B2B)
* **Dashboard Estadístico:** KPIs en tiempo real, gráficos de ventas mensuales, ingresos totales y control de usuarios activos.
* **Gestión de Inventario (CRUD):** Sistema completo para alta, edición y baja de productos, control de stock y subida de imágenes (multipart/form-data).
* **Logística y Despacho:** Interfaz para el avance de estados de órdenes de compra (Pendiente -> Preparación -> Enviado -> Entregado).
* **Control de Usuarios y Roles:** Administración de cuentas de clientes y asignación de privilegios administrativos.
* **Motor de Promociones:** Panel para crear, activar y expirar códigos de descuento personalizados.

---

## 🛠️ Arquitectura y Stack Tecnológico

### Frontend (Client)
* **Core:** React 18 (construido sobre Vite para HMR ultra rápido).
* **Enrutamiento:** React Router DOM v6 con protección de rutas (PrivateRoutes) basada en roles.
* **Estado Global:** React Context API (AuthContext, CartContext, NotificationContext).
* **UI/UX & Estilos:** 
  * **Tailwind CSS:** Diseño responsivo, utilitario y soporte nativo para Modo Oscuro/Claro (Glassmorphism).
  * **Radix UI:** Primitivas de interfaz sin estilos enfocadas en la **Accesibilidad (a11y)**.
  * **Lucide React:** Sistema de iconografía optimizado y ligero.
  * **Feedback UI:** Skeleton Loaders para tiempos de carga, Toasts para notificaciones y alertas interactivas.

### Backend (Server)
* **Entorno & Framework:** Node.js + Express.js siguiendo el patrón de diseño MVC (Models, Views/Routes, Controllers).
* **Base de Datos:** MongoDB (NoSQL) orquestado a través de Mongoose ODM.
* **Seguridad & Autenticación:** 
  * Implementación de **JSON Web Tokens (JWT)** para manejo de sesiones sin estado.
  * Hashing criptográfico de contraseñas con **Bcrypt.js**.
  * Sanitización de datos y configuración estricta de CORS.
* **Manejo de Archivos:** Middleware **Multer** para el procesamiento y almacenamiento seguro de imágenes de productos.
* **Integraciones:** Transbank Webpay SDK (Transacciones transaccionales y Webhooks de confirmación).

---

## 📸 Interfaz de Usuario y Flujos

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

## ⚙️ Instalación y Despliegue Local

Para correr este proyecto en tu máquina, necesitas tener instalado [Node.js](https://nodejs.org/) y [MongoDB](https://www.mongodb.com/).

### 1. Clonar el repositorio
```bash
git clone [https://github.com/IgnacioRuizMcode/techstore.git](https://github.com/IgnacioRuizMcode/techstore.git)
cd techstore
