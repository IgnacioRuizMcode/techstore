const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// ─── Pools de imágenes secundarias por categoría ───
const img = {
  notebooks: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
    'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800',
  ],
  computacion: [
    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800',
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800',
    'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800',
    'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800',
  ],
  componentes: [
    'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800',
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800',
    'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800',
  ],
  smartphones: [
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
    'https://images.unsplash.com/photo-1695048133142-1a20484d2e71?w=800',
    'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800',
  ],
  gaming: [
    'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800',
    'https://images.unsplash.com/photo-1606144042614-bf4e1e5b9b6b?w=800',
    'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800',
    'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800',
  ],
  audio: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
    'https://images.unsplash.com/photo-1588156979435-379b9d802b0a?w=800',
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
  ],
  hogar: [
    'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800',
    'https://images.unsplash.com/photo-1544451256-d79e0f780cd6?w=800',
    'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800',
    'https://images.unsplash.com/photo-1626908013947-df94de54984c?w=800',
  ],
  conectividad: [
    'https://images.unsplash.com/photo-1615526675159-e248c3021d6f?w=800',
    'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=800',
    'https://images.unsplash.com/photo-1583863788434-e42f2e84c2f7?w=800',
    'https://images.unsplash.com/photo-1544198365-fd5d0f2b5f6f?w=800',
  ],
  tablets: [
    'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
    'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
  ],
  accesorios: [
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
    'https://images.unsplash.com/photo-1587826080692-f439cd0b4d6f?w=800',
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800',
  ],
};

const pickRandom = (pool, count = 3) => {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, pool.length));
};

// ─── Imágenes principales representativas ───
const mainImg = {
  cpu_intel: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800',
  cpu_amd: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800',
  gpu_nvidia: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800',
  gpu_amd: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800',
  ram: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800',
  ssd: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800',
  placa: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
  fuente: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800',
  cooler: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800',
  notebook: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
  pc: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800',
  mac: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
  iphone: 'https://images.unsplash.com/photo-1695048133142-1a20484d2e71?w=800',
  smartphone: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
  tablet: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800',
  ipad: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
  kindle: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
  audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
  parlante: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
  microfono: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800',
  consola: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800',
  control: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800',
  teclado: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
  mouse: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
  webcam: 'https://images.unsplash.com/photo-1587826080692-f439cd0b4d6f?w=800',
  mochila: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
  soporte: 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800',
  cable: 'https://images.unsplash.com/photo-1615526675159-e248c3021d6f?w=800',
  hub: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=800',
  cargador: 'https://images.unsplash.com/photo-1583863788434-e42f2e84c2f7?w=800',
  watch: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800',
  camara: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800',
  router: 'https://images.unsplash.com/photo-1626908013947-df94de54984c?w=800',
  tv: 'https://images.unsplash.com/photo-1558002038-1055e2d0c2f8?w=800',
  asistente: 'https://images.unsplash.com/photo-1544451256-d79e0f780cd6?w=800',
  monitor: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
  silla: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800',
  mousepad: 'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?w=800',
};

const products = [];

// ─── Función helper ───
const addProducts = (list, pool) => {
  list.forEach(p => products.push({
    name: p.name,
    description: p.desc || `${p.name}. Producto de calidad garantizada.`,
    category: p.cat,
    brand: p.brand,
    basePrice: p.price,
    stock: Math.floor(Math.random() * 20) + 5,
    mainImage: p.img,
    images: pickRandom(pool, 3),
    features: p.features || ['Alta calidad', 'Garantía oficial'],
    variants: [],
  }));
};

// ═══════════════════════════════════════════════
// NOTEBOOKS (50 productos = 5 sub × 10)
// ═══════════════════════════════════════════════
addProducts([
  ...[...Array(10)].map((_, i) => ({
    name: `Notebook Gamer Acer Nitro ${i+1} RTX 40${60+i}`,
    brand: 'Acer', price: 899990 + i*50000, img: mainImg.notebook,
    cat: 'Notebooks', desc: 'Notebook gamer con pantalla 144Hz y RTX.'
  })),
  ...[...Array(10)].map((_, i) => ({
    name: `Ultrabook ASUS ZenBook ${i+1} OLED`,
    brand: 'ASUS', price: 799990 + i*30000, img: mainImg.notebook,
    cat: 'Notebooks', desc: 'Ultrabook ultraligero con pantalla OLED.'
  })),
  ...[...Array(10)].map((_, i) => ({
    name: `MacBook Pro ${14+i}" M3`,
    brand: 'Apple', price: 1999990 + i*200000, img: mainImg.mac,
    cat: 'Notebooks', desc: 'MacBook Pro con chip M3.'
  })),
  ...[...Array(10)].map((_, i) => ({
    name: `Workstation Dell Precision 7${i+1}00`,
    brand: 'Dell', price: 2499990 + i*300000, img: mainImg.notebook,
    cat: 'Notebooks', desc: 'Estación de trabajo móvil profesional.'
  })),
  ...[...Array(10)].map((_, i) => ({
    name: `Notebook 2 en 1 HP Spectre x360 ${i+1}`,
    brand: 'HP', price: 1099990 + i*50000, img: mainImg.notebook,
    cat: 'Notebooks', desc: 'Notebook convertible 2 en 1 táctil.'
  })),
], img.notebooks);

// ═══════════════════════════════════════════════
// COMPUTACIÓN (50)
// ═══════════════════════════════════════════════
addProducts([
  ...[...Array(10)].map((_, i) => ({
    name: `PC Escritorio HP EliteDesk ${i+1}`,
    brand: 'HP', price: 399990 + i*20000, img: mainImg.pc,
    cat: 'Computación', desc: 'PC de escritorio para oficina.'
  })),
  ...[...Array(10)].map((_, i) => ({
    name: `PC Gamer Custom RTX ${4060+i*10} ${i+1}`,
    brand: 'Custom', price: 999990 + i*100000, img: mainImg.pc,
    cat: 'Computación', desc: 'PC gamer armada a pedido.'
  })),
  ...[...Array(10)].map((_, i) => ({
    name: `All-in-One Lenovo IdeaCentre AIO ${i+1}`,
    brand: 'Lenovo', price: 599990 + i*30000, img: mainImg.pc,
    cat: 'Computación', desc: 'Todo en uno con pantalla táctil.'
  })),
  ...[...Array(10)].map((_, i) => ({
    name: `Mac Studio M2 Ultra ${i+1}`,
    brand: 'Apple', price: 3499990 + i*500000, img: mainImg.mac,
    cat: 'Computación', desc: 'Computadora de escritorio profesional.'
  })),
  ...[...Array(10)].map((_, i) => ({
    name: `Mini PC Intel NUC ${i+1} Pro`,
    brand: 'Intel', price: 599990 + i*50000, img: mainImg.pc,
    cat: 'Computación', desc: 'Mini PC compacta y potente.'
  })),
], img.computacion);

// ═══════════════════════════════════════════════
// COMPONENTES (90 = 9 sub × 10)
// ═══════════════════════════════════════════════
addProducts([
  ...[...Array(10)].map((_, i) => ({ name: `Procesador Intel Core i9-14900K ${i+1}`, brand: 'Intel', price: 749990, img: mainImg.cpu_intel, cat: 'Componentes', desc: 'CPU Intel de alto rendimiento.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Procesador AMD Ryzen 9 7950X ${i+1}`, brand: 'AMD', price: 699990, img: mainImg.cpu_amd, cat: 'Componentes', desc: 'CPU AMD Ryzen 9.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Tarjeta Gráfica NVIDIA GeForce RTX 4090 ${i+1}`, brand: 'ASUS', price: 2299990, img: mainImg.gpu_nvidia, cat: 'Componentes', desc: 'GPU NVIDIA Ada Lovelace.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Tarjeta Gráfica AMD Radeon RX 7900 XTX ${i+1}`, brand: 'Sapphire', price: 1199990, img: mainImg.gpu_amd, cat: 'Componentes', desc: 'GPU AMD RDNA 3.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Placa Madre ASUS ROG STRIX B650-A ${i+1}`, brand: 'ASUS', price: 279990, img: mainImg.placa, cat: 'Componentes', desc: 'Placa madre AM5.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Memoria RAM Corsair Vengeance 32GB DDR5 ${i+1}`, brand: 'Corsair', price: 139990, img: mainImg.ram, cat: 'Componentes', desc: 'Kit de memoria RAM.' })),
  ...[...Array(10)].map((_, i) => ({ name: `SSD Samsung 990 Pro 2TB NVMe ${i+1}`, brand: 'Samsung', price: 249990, img: mainImg.ssd, cat: 'Componentes', desc: 'Almacenamiento SSD ultrarrápido.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Fuente de Poder EVGA 850W Gold ${i+1}`, brand: 'EVGA', price: 129990, img: mainImg.fuente, cat: 'Componentes', desc: 'Fuente 80 Plus Gold modular.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Cooler CPU Noctua NH-D15 ${i+1}`, brand: 'Noctua', price: 109990, img: mainImg.cooler, cat: 'Componentes', desc: 'Cooler de alto rendimiento.' })),
], img.componentes);

// ═══════════════════════════════════════════════
// SMARTPHONES (60)
// ═══════════════════════════════════════════════
addProducts([
  ...[...Array(10)].map((_, i) => ({ name: `iPhone 15 Pro Max ${i+1}`, brand: 'Apple', price: 1399990, img: mainImg.iphone, cat: 'Smartphones', desc: 'iPhone de última generación.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Samsung Galaxy S24 Ultra ${i+1}`, brand: 'Samsung', price: 1149990, img: mainImg.smartphone, cat: 'Smartphones', desc: 'Smartphone Samsung Galaxy.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Xiaomi 14 Ultra ${i+1}`, brand: 'Xiaomi', price: 999990, img: mainImg.smartphone, cat: 'Smartphones', desc: 'Smartphone Xiaomi con Leica.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Google Pixel 8 Pro ${i+1}`, brand: 'Google', price: 899990, img: mainImg.smartphone, cat: 'Smartphones', desc: 'Smartphone Google Pixel.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Smartphone Pro Max Ultra ${i+1}`, brand: 'Samsung', price: 1599990, img: mainImg.smartphone, cat: 'Smartphones', desc: 'Gama alta profesional.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Samsung Galaxy A55 5G ${i+1}`, brand: 'Samsung', price: 349990, img: mainImg.smartphone, cat: 'Smartphones', desc: 'Gama media accesible.' })),
], img.smartphones);

// ═══════════════════════════════════════════════
// TABLETS (40)
// ═══════════════════════════════════════════════
addProducts([
  ...[...Array(10)].map((_, i) => ({ name: `iPad Air M1 ${i+1}`, brand: 'Apple', price: 699990, img: mainImg.ipad, cat: 'Tablets', desc: 'iPad versátil y potente.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Samsung Galaxy Tab S9+ ${i+1}`, brand: 'Samsung', price: 899990, img: mainImg.tablet, cat: 'Tablets', desc: 'Tablet Samsung con S Pen.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Lenovo Tab P12 Pro ${i+1}`, brand: 'Lenovo', price: 599990, img: mainImg.tablet, cat: 'Tablets', desc: 'Tablet Lenovo premium.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Kindle Paperwhite ${i+1}`, brand: 'Amazon', price: 129990, img: mainImg.kindle, cat: 'Tablets', desc: 'Lector de libros electrónicos.' })),
], img.tablets);

// ═══════════════════════════════════════════════
// AUDIO (50)
// ═══════════════════════════════════════════════
addProducts([
  ...[...Array(10)].map((_, i) => ({ name: `Audífonos Sony WH-1000XM5 ${i+1}`, brand: 'Sony', price: 349990, img: mainImg.audio, cat: 'Audio', desc: 'Audífonos inalámbricos ANC.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Headset Gamer HyperX Cloud ${i+1}`, brand: 'HyperX', price: 89990, img: mainImg.audio, cat: 'Audio', desc: 'Audífonos gamer con micrófono.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Parlante JBL Charge 5 ${i+1}`, brand: 'JBL', price: 159990, img: mainImg.parlante, cat: 'Audio', desc: 'Parlante portátil Bluetooth.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Micrófono Blue Yeti X ${i+1}`, brand: 'Blue', price: 199990, img: mainImg.microfono, cat: 'Audio', desc: 'Micrófono profesional USB.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Soundbar LG SN4 ${i+1}`, brand: 'LG', price: 249990, img: mainImg.parlante, cat: 'Audio', desc: 'Barra de sonido envolvente.' })),
], img.audio);

// ═══════════════════════════════════════════════
// GAMING (60)
// ═══════════════════════════════════════════════
addProducts([
  ...[...Array(10)].map((_, i) => ({ name: `Consola PlayStation 5 ${i+1}`, brand: 'Sony', price: 599990, img: mainImg.consola, cat: 'Gaming', desc: 'Consola de videojuegos PS5.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Control DualSense ${i+1}`, brand: 'Sony', price: 79990, img: mainImg.control, cat: 'Gaming', desc: 'Control inalámbrico PS5.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Teclado Gamer Razer Huntsman ${i+1}`, brand: 'Razer', price: 159990, img: mainImg.teclado, cat: 'Gaming', desc: 'Teclado óptico gaming.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Mouse Gamer Logitech G502 ${i+1}`, brand: 'Logitech', price: 69990, img: mainImg.mouse, cat: 'Gaming', desc: 'Mouse gaming RGB.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Monitor Gamer ASUS TUF 27" ${i+1}`, brand: 'ASUS', price: 349990, img: mainImg.monitor, cat: 'Gaming', desc: 'Monitor gaming 165Hz.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Silla Gamer Corsair T3 Rush ${i+1}`, brand: 'Corsair', price: 299990, img: mainImg.silla, cat: 'Gaming', desc: 'Silla ergonómica gaming.' })),
], img.gaming);

// ═══════════════════════════════════════════════
// HOGAR (50)
// ═══════════════════════════════════════════════
addProducts([
  ...[...Array(10)].map((_, i) => ({ name: `Smartwatch Apple Watch Series ${i+1}`, brand: 'Apple', price: 399990, img: mainImg.watch, cat: 'Hogar', desc: 'Reloj inteligente Apple.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Asistente Virtual Echo Dot ${i+1}`, brand: 'Amazon', price: 49990, img: mainImg.asistente, cat: 'Hogar', desc: 'Altavoz inteligente con Alexa.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Cámara Seguridad Tapo C${i+1}00`, brand: 'TP-Link', price: 29990, img: mainImg.camara, cat: 'Hogar', desc: 'Cámara de seguridad WiFi.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Router WiFi 6 Archer AX${i+1}`, brand: 'TP-Link', price: 89990, img: mainImg.router, cat: 'Hogar', desc: 'Router de alta velocidad.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Smart TV Samsung 65" QLED ${i+1}`, brand: 'Samsung', price: 899990, img: mainImg.tv, cat: 'Hogar', desc: 'Televisor inteligente 4K.' })),
], img.hogar);

// ═══════════════════════════════════════════════
// CONECTIVIDAD (50)
// ═══════════════════════════════════════════════
addProducts([
  ...[...Array(10)].map((_, i) => ({ name: `Cable USB-C 100W ${i+1}m`, brand: 'Anker', price: 9990 + i*2000, img: mainImg.cable, cat: 'Conectividad', desc: 'Cable de carga rápida.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Hub USB-C 7 en 1 ${i+1}`, brand: 'UGREEN', price: 39990, img: mainImg.hub, cat: 'Conectividad', desc: 'Hub multipuerto USB-C.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Cargador GaN 65W ${i+1}`, brand: 'AUKEY', price: 29990, img: mainImg.cargador, cat: 'Conectividad', desc: 'Cargador rápido GaN.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Switch Ethernet Gigabit ${i+1} Puertos`, brand: 'TP-Link', price: 19990, img: mainImg.router, cat: 'Conectividad', desc: 'Switch de red.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Cable Thunderbolt 4 ${i+1}m`, brand: 'CalDigit', price: 49990, img: mainImg.cable, cat: 'Conectividad', desc: 'Cable Thunderbolt 4.' })),
], img.conectividad);

// ═══════════════════════════════════════════════
// ACCESORIOS (60)
// ═══════════════════════════════════════════════
addProducts([
  ...[...Array(10)].map((_, i) => ({ name: `Teclado Mecánico ${i+1}`, brand: 'Logitech', price: 89990 + i*10000, img: mainImg.teclado, cat: 'Accesorios', desc: 'Teclado ergonómico.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Mouse Inalámbrico ${i+1}`, brand: 'Logitech', price: 49990 + i*5000, img: mainImg.mouse, cat: 'Accesorios', desc: 'Mouse de alta precisión.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Webcam HD ${i+1}`, brand: 'Logitech', price: 49990 + i*5000, img: mainImg.webcam, cat: 'Accesorios', desc: 'Cámara web Full HD.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Mochila para Notebook ${i+1}`, brand: 'Samsonite', price: 39990 + i*3000, img: mainImg.mochila, cat: 'Accesorios', desc: 'Mochila acolchada.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Soporte Monitor ${i+1}`, brand: 'North Bayou', price: 29990 + i*2000, img: mainImg.soporte, cat: 'Accesorios', desc: 'Brazo articulado para monitor.' })),
  ...[...Array(10)].map((_, i) => ({ name: `Mousepad XXL ${i+1}`, brand: 'Corsair', price: 19990 + i*2000, img: mainImg.mousepad, cat: 'Accesorios', desc: 'Alfombrilla extendida.' })),
], img.accesorios);

// ─── EJECUCIÓN ──────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    await Product.deleteMany({});
    console.log('Productos anteriores eliminados');
    console.log(`Insertando ${products.length} productos...`);
    for (const p of products) {
      await Product.create(p);
    }
    console.log(`${products.length} productos creados exitosamente.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};
seed();