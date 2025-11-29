import { Controller, Post, Body, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() authDto: AuthDto) {
    return this.authService.register(authDto);
  }

  @Post('login')
  async login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}