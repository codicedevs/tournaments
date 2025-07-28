import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { Role } from '../users/entities/user.entity';

async function createAdminUser() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    const adminUser = await usersService.create({
      email: 'admin@tournaments.com',
      password: 'admin123',
      name: 'Administrador',
      role: Role.Admin,
      isVerified: true,
      mustChangePassword: true,
    });

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Nombre:', adminUser.name);
    console.log('🔑 Contraseña inicial: admin123');
    console.log(
      '⚠️  IMPORTANTE: Debe cambiar la contraseña en el primer login',
    );
    console.log('🆔 ID:', adminUser._id);
  } catch (error) {
    if (
      error.message.includes('duplicate key error') ||
      error.message.includes('E11000')
    ) {
      console.log('ℹ️  El usuario administrador ya existe');
    } else {
      console.error('❌ Error al crear usuario administrador:', error.message);
    }
  } finally {
    await app.close();
  }
}

createAdminUser();
