const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

console.log('🔍 Conectando a MongoDB Atlas...', process.env.DBPASSWORD);
// Usar la misma configuración que el proyecto
const MONGODB_URI = `mongodb+srv://matiDb:${process.env.DBPASSWORD}@dbprueba.twy3nho.mongodb.net/tournaments?retryWrites=true&w=majority&appName=DbPrueba`;

// Conectar a MongoDB Atlas
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema de Usuario
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Player'],
    default: 'Player',
  },
  profilePicture: String,
  phone: String,
  isVerified: { type: Boolean, default: false },
  mustChangePassword: { type: Boolean, default: true },
  lastPasswordChange: Date,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    console.log('🔍 Conectando a MongoDB Atlas...');

    // Verificar si ya existe
    const existingAdmin = await User.findOne({
      email: 'admin@tournaments.com',
    });

    if (existingAdmin) {
      console.log('ℹ️  El usuario administrador ya existe');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Nombre:', existingAdmin.name);
      return;
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear el usuario admin
    const adminUser = new User({
      email: 'admin@tournaments.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'Admin',
      isVerified: true,
      mustChangePassword: true,
    });

    await adminUser.save();

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Nombre:', adminUser.name);
    console.log('🔑 Contraseña inicial: admin123');
    console.log(
      '⚠️  IMPORTANTE: Debe cambiar la contraseña en el primer login',
    );
    console.log('🆔 ID:', adminUser._id);
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

// Ejecutar el script
createAdminUser();
