const mongoose = require('mongoose');
require('dotenv').config();

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

async function checkUser() {
  try {
    console.log('🔍 Conectando a MongoDB Atlas...');
    console.log('🔍 Verificando usuario admin en la base de datos...');

    const user = await User.findOne({ email: 'admin@tournaments.com' });

    if (user) {
      console.log('✅ Usuario encontrado:');
      console.log('📧 Email:', user.email);
      console.log('👤 Nombre:', user.name);
      console.log(
        '🔑 Contraseña hasheada:',
        user.password.substring(0, 20) + '...',
      );
      console.log('👑 Rol:', user.role);
      console.log('✅ Verificado:', user.isVerified);
      console.log('⚠️  Debe cambiar contraseña:', user.mustChangePassword);
      console.log('🆔 ID:', user._id);
    } else {
      console.log('❌ Usuario admin no encontrado');
      console.log('💡 Ejecuta: npm run create-admin-direct');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkUser();
