import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleOAuthService {
  private oauthClient: OAuth2Client;

  constructor() {
    this.oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
  }

  async verifyToken(token: string) {
    const ticket = await this.oauthClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }
}