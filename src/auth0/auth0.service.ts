import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class Auth0Service {
  async verifyToken(token: string) {
    const decoded = jwt.verify(token, 'YOUR_AUTH0_CLIENT_SECRET'); // Use Auth0's public key for verification
    return decoded;
  }
}
