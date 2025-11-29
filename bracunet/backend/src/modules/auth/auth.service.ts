import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(authDto: AuthDto): Promise<User> {
    const user = new this.userModel(authDto);
    return user.save();
  }

  async login(authDto: AuthDto): Promise<{ accessToken: string }> {
    const user = await this.validateUser(authDto.email, authDto.password);
    const accessToken = this.jwtService.sign({ id: user._id });
    return { accessToken };
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}