import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { MailerService } from '@nestjs-modules/mailer';
import {
  RequestResetCodeDto,
  ResetPasswordDto,
  VerifyResetCodeDto,
} from './dto/forget-reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  generateOtpCode,
  getTokens,
  hashOtpCode,
  verifyOtp,
} from './auth.utils';
import { Plan_name, Subscription_status } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  // register
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already registered!');
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      parseInt(process.env.SALT_ROUND!),
    );

    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address:dto.address,
        password: hashedPassword,
      },
    });
    // create initial subscription table for all user
    await this.prisma.subscription.create({
      data: {
        user_id: newUser.id,
        plan_name: Plan_name.FREE,
        start_data: new Date(),
        status: Subscription_status.ACTIVE,
      },
    })
    const tokens = await getTokens(
      this.jwtService,
      newUser.id,
      newUser.email,
      newUser.role,
    );
    return { user: newUser, ...tokens };
  }

  // login
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new ForbiddenException('Invalid credentials');
    }

    if (user.isDeleted) {
      throw new BadRequestException('User is Deleted!');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new ForbiddenException('Invalid credentials');
    }

    const tokens = await getTokens(
      this.jwtService,
      user.id,
      user.email,
      user.role,
    );
    return { user, ...tokens };
  }

  // refresh token
  async refreshTokens(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });
      if (!user) throw new UnauthorizedException('Invalid refresh token');
      if (user.isDeleted) {
        throw new BadRequestException('User is Deleted');
      }
      return getTokens(this.jwtService, user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // change password
  async changePassword(email: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new NotFoundException('User not found');
    }
    if (user.isDeleted) {
      throw new BadRequestException('User is Deleted!');
    }
    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException("Passwords don't match");
    }

    const hashed = await bcrypt.hash(
      dto.newPassword,
      parseInt(process.env.SALT_ROUND!),
    );
    await this.prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    return { message: 'Password changed successfully' };
  }

  // forget and reset password
  async requestResetCode(dto: RequestResetCodeDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.isDeleted) {
      throw new BadRequestException('User is Deleted!');
    }

    const code = generateOtpCode();
    const hashedCode = await hashOtpCode(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otpCode.create({
      data: { email: dto.email, code: hashedCode, expiresAt },
    });

    await this.mailerService.sendMail({
      to: dto.email,
      subject: 'Reset Password Code',
      text: `Your OTP code is ${code}. It will expire in 5 minutes.`,
    });

    return { message: 'Reset code sent' };
  }

  async verifyResetCode(dto: VerifyResetCodeDto) {
    return verifyOtp(this.prisma, dto.email, dto.code);
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("Passwords don't match");
    }

    const verified = await this.prisma.otpCode.findFirst({
      where: { email: dto.email, verified: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!verified) {
      throw new BadRequestException('OTP not verified');
    }

    const hashed = await bcrypt.hash(
      dto.password,
      parseInt(process.env.SALT_ROUND!),
    );
    await this.prisma.user.update({
      where: { email: dto.email },
      data: { password: hashed },
    });

    await this.prisma.otpCode.deleteMany({ where: { email: dto.email } });

    return { message: 'Password reset successful' };
  }
}
