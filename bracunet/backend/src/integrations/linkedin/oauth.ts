import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

@Injectable()
export class LinkedInService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly oauth2Client: OAuth2Client;

  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID;
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    this.oauth2Client = new OAuth2Client(this.clientId, this.clientSecret, this.redirectUri);
  }

  getAuthUrl(): string {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['r_liteprofile', 'r_emailaddress'],
    });
    return authUrl;
  }

  async getAccessToken(code: string): Promise<string> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens.access_token;
  }

  async getUserProfile(accessToken: string): Promise<any> {
    const response = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status !== 200) {
      throw new HttpException('Failed to fetch user profile', HttpStatus.BAD_REQUEST);
    }

    return response.data;
  }

  async getUserEmail(accessToken: string): Promise<string> {
    const response = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status !== 200) {
      throw new HttpException('Failed to fetch user email', HttpStatus.BAD_REQUEST);
    }

    return response.data.elements[0]['handle~'].emailAddress;
  }
}