import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(authDto: AuthDto): Promise<UserDocument> {
    const user = new this.userModel(authDto);
    return user.save();
  }

  async login(authDto: AuthDto): Promise<{ accessToken: string }> {
    const user = await this.validateUser(authDto.email, authDto.password);
    const accessToken = this.jwtService.sign({ id: user._id.toString() });
    return { accessToken };
  }

  private async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}