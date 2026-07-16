const path = require('path');

// Carga .env desde la raíz del servidor (un nivel arriba de /src)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Verificación obligatoria
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
});