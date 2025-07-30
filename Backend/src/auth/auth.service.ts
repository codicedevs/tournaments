import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/entities/user.entity';
import { SignInDto } from './dto/signin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(signInDto: SignInDto) {
    const user = await this.validateUser(signInDto.email, signInDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture,
        mustChangePassword: user.mustChangePassword,
        isVerified: user.isVerified,
      },
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Validar que las contraseñas coincidan
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Si no es el primer login, validar la contraseña actual
    if (!user.mustChangePassword && changePasswordDto.oldPassword) {
      const isOldPasswordValid = await bcrypt.compare(
        changePasswordDto.oldPassword,
        user.password,
      );
      if (!isOldPasswordValid) {
        throw new BadRequestException('La contraseña actual es incorrecta');
      }
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Actualizar el usuario
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
      mustChangePassword: false,
      lastPasswordChange: new Date(),
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async getUserProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .exec();
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return user;
  }
}
